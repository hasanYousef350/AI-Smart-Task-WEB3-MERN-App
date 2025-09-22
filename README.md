# AI Smart Task WEB3 MERN App

A decentralized task management application built with MERN stack and blockchain technology for educational and training purposes.

## 🚀 Features

- **Blockchain Integration**: Tasks are managed through smart contracts on Ethereum
- **User Authentication**: Google OAuth and traditional email/password authentication
- **Task Management**: Create, update, delete, and track tasks with blockchain verification
- **Team Collaboration**: Invite team members and manage roles
- **File Management**: Upload and manage project files
- **Analytics Dashboard**: Visual insights into task completion and project progress
- **Calendar Integration**: Schedule and track task deadlines
- **Real-time Updates**: Live updates across the application

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Nodemailer** - Email sending
- **Multer** - File upload handling

### Blockchain
- **Ethereum** - Blockchain platform
- **Hardhat** - Development environment
- **Ethers.js** - Ethereum library
- **Solidity** - Smart contract language
- **Infura** - Ethereum node provider

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MyProVerse/AI-Smart-Task-WEB3-MERN-App.git
cd AI-Smart-Task-WEB3-MERN-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the following variables:

```env
# Blockchain Configuration
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/TasksDB

# Email Configuration
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Contract Configuration
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Frontend Setup

```bash
cd ../frontend/frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000

# App Configuration
REACT_APP_APP_NAME=AI Smart Task Chain
REACT_APP_VERSION=1.0.0
```

### 4. Smart Contract Setup

```bash
cd ../../backend
npx hardhat compile
npx hardhat node # Run local blockchain (in a separate terminal)
npx hardhat run scripts/deploy.js --network localhost
```

## 🚀 Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3000`

### Start the Frontend Development Server

```bash
cd frontend/frontend
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 📁 Project Structure

```
AI-Smart-Task-WEB3-MERN-App/
├── backend/
│   ├── contracts/           # Smart contracts
│   ├── artifacts/          # Compiled contracts
│   ├── public/            # Static HTML files
│   ├── uploads/           # File uploads (gitignored)
│   ├── models/            # Database models
│   ├── .env.example       # Environment variables example
│   ├── .gitignore         # Git ignore rules
│   ├── server.js          # Main server file
│   ├── db.js             # Database connection
│   ├── ethers.js         # Blockchain interaction
│   └── package.json      # Dependencies and scripts
├── frontend/
│   └── frontend/
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/        # Page components
│       │   ├── services/     # API services
│       │   └── contexts/     # React contexts
│       ├── public/          # Static assets
│       ├── .env.example     # Environment variables example
│       ├── .gitignore       # Git ignore rules
│       └── package.json     # Dependencies and scripts
└── README.md               # Project documentation
```

## 🔐 Security Features

- Environment variables for sensitive data
- Password hashing with bcrypt
- Session management with secure cookies
- Input validation and sanitization
- CORS configuration
- File upload restrictions

## 🌐 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /auth/google` - Google OAuth
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Password reset

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get single task
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /createTask` - Create task on blockchain

### Team Management
- `POST /api/send-invites` - Send team invitations
- `GET /api/team-members` - Get team members
- `POST /api/accept-invite` - Accept invitation
- `DELETE /api/team-members/:id` - Remove team member

### Files
- `POST /upload` - Upload files
- `GET /files` - Get all files
- `DELETE /files/:id` - Delete file

## 🤝 Contributing

This project was created for educational and training purposes. Contributions are welcome!

### Team Members
- **Frontend Development**: Hamza (MyProVerse)
- **Backend Development**: Usman Mehmood and team members

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is built for educational and training purposes. Do not use real private keys or sensitive data in development. Always use test networks for blockchain interactions during development.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact the development team

## 🔗 Links

- **Repository**: [https://github.com/MyProVerse/AI-Smart-Task-WEB3-MERN-App](https://github.com/MyProVerse/AI-Smart-Task-WEB3-MERN-App)
- **Frontend Demo**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

---

**Built with ❤️ for learning blockchain and MERN stack technologies**