"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Since we're using session-based auth, we can check if user is authenticated
      // by making a request to a protected endpoint
      const response = await authAPI.getCurrentUser()
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      toast.success(response.data.message)
      await checkAuthStatus() // Refresh user data
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup({ name, email, password })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email })
      toast.success("Password reset email sent")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset email"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword({ token, password })
      toast.success("Password reset successfully")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
