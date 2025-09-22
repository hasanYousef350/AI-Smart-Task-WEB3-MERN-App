"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { taskAPI } from "../../services/api"
import { ArrowLeft, Edit, Trash2, Calendar, Flag, CheckCircle } from "lucide-react"
import Modal from "../../components/UI/Modal"
import TaskForm from "./TaskForm"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskAPI.getTask(id),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task deleted successfully")
      navigate("/tasks")
    },
    onError: () => {
      toast.error("Failed to delete task")
    },
  })

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!task?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <button onClick={() => navigate("/tasks")} className="btn-primary mt-4">
          Back to Tasks
        </button>
      </div>
    )
  }

  const taskData = task.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate("/tasks")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{taskData.title}</h1>
            <p className="text-gray-600">Task Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900">{taskData.title}</p>
              </div>

              {taskData.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{taskData.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Information */}
          {taskData.txHash && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
                  <p className="text-gray-900 font-mono text-sm break-all">{taskData.txHash}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    taskData.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : taskData.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {taskData.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    taskData.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : taskData.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {taskData.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Due Date</span>
                </div>
                <span className="text-sm text-gray-900">{new Date(taskData.dueDate).toLocaleDateString()}</span>
              </div>

              {taskData.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Created</span>
                  <span className="text-sm text-gray-900">{new Date(taskData.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task" size="large">
        <TaskForm task={taskData} onClose={() => setIsEditModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default TaskDetail
