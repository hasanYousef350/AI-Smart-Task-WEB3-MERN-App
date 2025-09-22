const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {ethers} = require('ethers');
const { createTaskOnChain } = require('./ethers');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const User = require('./users');
const Task = require('./tasks');
const Agenda = require('./agenda');
const File = require('./files_metadata');
const Invitation = require('./members');
connectDB();

const app = express();
const port = process.env.PORT || 3000;

const contractABI = require('./artifacts/contracts/TaskManager.sol/TaskManager.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


// Session and Passport setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());


// Passport Google OAuth setup
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));


// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// const reset_transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.EMAIL_USERNAME || 'hassan.pink123@gmail.com',
//     pass: process.env.EMAIL_PASSWORD || 'pphq mtnc hzuj kedm'
//   }
// });

// Add this right after creating your transporter
// reset_transporter.verify((error, success) => {
//   if (error) {
//     console.error('SMTP Connection Error:', error);
//   } else {
//     console.log('SMTP Server is ready to send messages');
//   }
// });
// Routes


// Task Creation in BlockChain

app.post("/createTask", async (req, res) => {
  const { content } = req.body;
  console.log("Creating task on chain with content:", content);

  try {
    const txHash = await createTaskOnChain(content);
    console.log("✅ Task created on chain. Tx hash:", txHash);
    res.json({ success: true, txHash });
  } catch (err) {
    console.error("❌ Error creating task on chain:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.put("/updateTask/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { 
    newContent,
    action = "updated",  // Default action
    details = ""        // Default details
  } = req.body;

  try {
    // 1. Get signer from authenticated session
    const signer = getSignerFromAuth(req); // Implement your auth logic
    
    // 2. Send transaction with update metadata
    const tx = await tasksContract
      .connect(signer)
      .updateTaskWithDetails(
        taskId,
        newContent,
        action,  // "updated", "status_changed", etc.
        details // JSON string with update details
      );

    const receipt = await tx.wait();
    
    // 3. Get the recorded update from blockchain
    const updateEvents = await tasksContract.queryFilter(
      tasksContract.filters.TaskUpdated(taskId),
      receipt.blockNumber,
      receipt.blockNumber
    );

    const lastUpdate = updateEvents[0].args;

    res.json({
      success: true,
      taskId,
      updater: lastUpdate.updater,
      action: lastUpdate.action,
      details: lastUpdate.details,
      txHash: receipt.transactionHash,
      timestamp: new Date(lastUpdate.timestamp * 1000)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log(`Password reset requested for: ${email}`);

  try {
    // 1. Find user (security: don't reveal if user doesn't exist)
    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with this email (security response)');
      return res.json({ 
        message: 'If an account exists with this email, a reset link has been sent.'
      });
    }

    // 2. Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    
    // 3. Save to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // 4. Create reset URL
    const resetUrl = `${req.headers.origin}/reset-password?token=${resetToken}`;
    console.log(`Generated reset URL: ${resetUrl}`);

    // 5. Email options with enhanced configuration
    const mailOptions = {
      from: `"Password Support" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You requested to reset your password for AI Smart Task Chain.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
               color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
               Reset Password
            </a>
          </div>
          <p style="font-size: 0.9em; color: #666;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          <p style="font-size: 0.8em; color: #999;">
            Can't click the button? Copy and paste this link into your browser:<br>
            ${resetUrl}
          </p>
        </div>
      `,
      text: `To reset your password, please visit: ${resetUrl}\n\nThis link expires in 1 hour.`,
      priority: 'high'
    };

    // 6. Send email with detailed logging
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response
    });

    res.json({ 
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    });

  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false,
      message: 'Error sending reset email. Please try again later.'
    });
  }
});



app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    // 1. Validate inputs
    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // 2. Find user with valid token (add proper error logging)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      console.error('Invalid token details:', {
        token,
        currentTime: new Date(),
        queryResult: await User.findOne({ resetPasswordToken: token })
      });
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please request a new password reset.' 
      });
    }

    // 3. Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ 
      success: true,
      message: 'Password has been reset successfully.' 
    });

  } catch (error) {
    console.error('Password reset error:', {
      error: error.message,
      stack: error.stack,
      token: token,
      time: new Date()
    });
    res.status(500).json({ 
      message: 'Error resetting password. Please try again.' 
    });
  }
});


// Updated Invitation Routes

app.post('/api/send-invites', async (req, res) => {
  const { emails, role = 'Member', name } = req.body;

  // Validate input
  if (!emails || !Array.isArray(emails)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email list format'
    });
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name is required for invitation'
    });
  }

  try {
    const results = [];

    for (const email of emails) {
      try {
        // Validate email format
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail) {
          results.push({ email, success: false, error: 'Invalid email format' });
          continue;
        }

        // Check for existing registered user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          results.push({ email, success: false, error: 'User already registered' });
          continue;
        }

        // Check for existing invitation
        const existingInvite = await Invitation.findOne({ email });
        if (existingInvite) {
          results.push({ email, success: false, error: 'Invitation already sent' });
          continue;
        }

        // Generate unique token
        const token = crypto.randomBytes(16).toString('hex');

        // Create and save invitation
        const newInvite = new Invitation({
          email,
          name,
          role,
          token,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        });

        await newInvite.save();

        // Send invitation email
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;
        await transporter.sendMail({
          from: `"AI Smart Task Chain" <${process.env.EMAIL_USERNAME}>`,
          to: email,
          subject: `You're invited to join as ${role}`,
          html: `
            <p>Hello <strong>${name}</strong>,</p>
            <p>You've been invited to join our team as <strong>${role}</strong>.</p>
            <p><a href="${inviteLink}">Click here to accept the invitation</a></p>
            <p>This link expires in 14 days.</p>
          `
        });

        results.push({ email, success: true });

      } catch (err) {
        console.error(`Error processing invite for ${email}:`, err);
        results.push({
          email,
          success: false,
          error: err.message.includes('duplicate key')
            ? 'Duplicate invitation'
            : err.message
        });
      }
    }

    const anySuccess = results.some(r => r.success);
    res.status(anySuccess ? 200 : 400).json({
      success: anySuccess,
      results
    });

  } catch (err) {
    console.error('Server error while sending invites:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


app.get('/api/team-members', async (req, res) => {
  try {
    const members = await Invitation.find({}, 'name email role invitedAt');
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch team members' 
    });
  }
});


app.post('/api/accept-invite', async (req, res) => {
  const { name, password, token } = req.body;

  try {
    const invitation = await Invitation.findOne({ token });

    if (!invitation || invitation.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invitation.' });
    }

    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    const newUser = new User({
      full_name: name,
      email: invitation.email,
      password: password, // ❗ You should hash this later
      role: invitation.role
    });

    await newUser.save();
    await Invitation.deleteOne({ _id: invitation._id }); // Clean up the token

    res.json({ success: true, message: 'User registered successfully' });

  } catch (err) {
    console.error('Accept invite error:', err);
    res.status(500).json({ success: false, message: 'Server error accepting invite' });
  }
});

// DELETE /api/team-members/:id
app.delete('/api/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received delete request for ID:', id);

    const deleted = await Invitation.findByIdAndDelete(id);
    console.log('Deleted:', deleted);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

app.post('/api/project-status', async (req, res) => {
  try {
    const { status } = req.body;
    res.json({ 
      success: true,
      message: 'Project status updated successfully'
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update project status' 
    });
  }
});


// Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({ full_name: name, email, password });
    await newUser.save();

    return res.status(200).json({ message: 'Signup successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error signing up' });
  }
});

app.get('/invite/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation link.' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This invitation link has expired.' });
    }

    res.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        name: invitation.name,
        token: invitation.token
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (user) {
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging in' });
  }
});


// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task with enhanced data validation
app.get('/tasks/:id', async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid task ID format' 
      });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        error: 'Task not found' 
      });
    }

    // Build response object with required fields
    const responseData = {
      _id: task._id,
      title: task.title || '',
      project: task.project || '',
      status: task.status || 'To Do',
      assignee: task.assignee || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
      priority: task.priority || 'Medium',
      createdAt: task.createdAt,
      lastUpdated: task.lastUpdated
    };

    res.json({
      success: true,
      data: responseData
    });
    
  } catch (err) {
    console.error('GET task error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching task'
    });
  }
});

//Create new task
app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task({
      title: req.body.title,
      project: req.body.project,
      status: req.body.status,
      assignee: req.body.assignee,
      dueDate: new Date(req.body.dueDate),
      priority: req.body.priority,
      createdAt: new Date(),
      lastUpdated: new Date()
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Add last updated timestamp
    updates.lastUpdated = new Date();

    // If dueDate is being updated, convert to Date object
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Task.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/api/calendar-events', async (req, res) => {
  try {
    const tasks = await Task.find(); // ✅ No filter
    const agendas = await Agenda.find(); // Optional: keep or remove

    const taskEvents = tasks.map(t => ({
      id: `task-${t._id}`,
      title: `[${t.project}] ${t.title}`,
      start: t.dueDate, // 👈 used for calendar date
      end: t.dueDate,   // optional: can be null or t.dueDate + 1hr
      type: 'Task',
      color: t.priority === 'High' ? '#dc3545' :
             t.priority === 'Medium' ? '#fd7e14' : '#6c757d',
      status: t.status || '',
      description: t.description || ''
    }));

    const agendaEvents = agendas.map(a => ({
      id: `agenda-${a._id}`,
      title: a.title,
      start: a.dueDate,
      type: 'Agenda',
      color: '#0d6efd'
    }));

    res.json([...taskEvents, ...agendaEvents]);
  } catch (err) {
    console.error("Error in calendar-events route:", err);
    res.status(500).json({ error: 'Failed to load calendar events' });
  }
});

// Create agenda item (for modal)

app.get('/api/agendas', async (req, res) => {
  const agendas = await Agenda.find();
  res.json({ data: agendas });
});

app.post('/api/agendas', async (req, res) => {
  const { title, dueDate } = req.body;
  const agenda = new Agenda({ title, dueDate });
  await agenda.save();
  res.status(201).json({ message: 'Agenda created', data: agenda });
});

app.delete('/api/agendas/:id', async (req, res) => {
  await Agenda.findByIdAndDelete(req.params.id);
  res.json({ message: 'Agenda deleted' });
});

//Files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.array('files'), async (req, res) => {
  const uploader = req.body.uploader || 'Anonymous';

  try {
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new File({
          name: file.originalname,
          size: file.size,
          path: file.path,
          uploader: uploader
        });
        await newFile.save();
        return newFile;
      })
    );

    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

app.get('/api/analytics-data', async (req, res) => {
  try {
    const Task = mongoose.model('Task'); // use your Task model
    const tasks = await Task.find();

    const statusCounts = { 'To Do': 0, 'In Progress': 0, 'Completed': 0 };
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };

    tasks.forEach(task => {
      if (statusCounts[task.status] !== undefined) statusCounts[task.status]++;
      if (priorityCounts[task.priority] !== undefined) priorityCounts[task.priority]++;
    });

    res.json({ statusCounts, priorityCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analytics data fetch failed' });
  }
});


// Get all files
app.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve files' });
  }
});

// Delete file
app.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    fs.unlink(file.path, async (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to delete file' });

      await File.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

// In server.js, replace the existing /api/users endpoint with this:
app.get('/api/users', async (req, res) => {
  try {
    // Get registered users
    const registeredUsers = await User.find({}, 'full_name email role');
    
    // Get invited members who haven't registered yet
    const invitedMembers = await Invitation.find({}, 'name email role');
    
    // Combine and format the data
    const users = [
      ...registeredUsers.map(u => ({
        _id: u._id,
        name: u.full_name,
        email: u.email,
        role: u.role,
        type: 'Registered'
      })),
      ...invitedMembers.map(i => ({
        _id: i._id,
        name: i.name,
        email: i.email,
        role: i.role,
        type: 'Invited'
      }))
    ];
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// // Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
      success: false,
      message: 'Internal server error'
  });
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173/' }), (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
});

// Forgot Password Route (Placeholder)
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    // Check if user exists in database
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user doesn't exist
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate reset token (use crypto or a library like jsonwebtoken)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user in database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email (in a real app, you'd use nodemailer or similar)
    // await sendPasswordResetEmail(user.email, resetUrl);

    // Respond with success
    res.json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error processing your request. Please try again.' });
  }
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Server start
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});