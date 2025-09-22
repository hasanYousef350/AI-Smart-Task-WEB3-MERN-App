"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout/Layout"
import Login from "./pages/Auth/Login"
import Signup from "./pages/Auth/Signup"
import ForgotPassword from "./pages/Auth/ForgotPassword"
import ResetPassword from "./pages/Auth/ResetPassword"
import Dashboard from "./pages/Dashboard/Dashboard"
import Tasks from "./pages/Tasks/Tasks"
import TaskDetail from "./pages/Tasks/TaskDetail"
import Team from "./pages/Team/Team"
import Files from "./pages/Files/Files"
import Calendar from "./pages/Calendar/Calendar"
import Analytics from "./pages/Analytics/Analytics"
import AcceptInvite from "./pages/Team/AcceptInvite"
import LoadingSpinner from "./components/UI/LoadingSpinner"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Protected Routes */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="team" element={<Team />} />
        <Route path="files" element={<Files />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
