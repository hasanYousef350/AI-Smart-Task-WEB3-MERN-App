"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { taskAPI } from "../../services/api"
import { Plus, Search, MoreVertical, Trash2 } from "lucide-react"
import Modal from "../../components/UI/Modal"
import TaskForm from "./TaskForm"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const Tasks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const queryClient = useQueryClient()
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskAPI.getAllTasks,
  })

  const deleteTaskMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete task")
    },
  })

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const taskData = tasks?.data || []

  // Filter tasks
  const filteredTasks = taskData.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your tasks and track progress</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
              <option value="all">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input-field">
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  task.priority === "High"
                    ? "bg-red-500"
                    : task.priority === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              ></div>
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <Link to={`/tasks/${task._id}`} className="block">
              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{task.title}</h3>
            </Link>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Priority:</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Due Date:</span>
                <span className="text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <Link to={`/tasks/${task._id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Details
              </Link>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-red-600 hover:text-red-700 p-1"
                disabled={deleteTaskMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tasks found</p>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            Create your first task
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="large"
      >
        <TaskForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default Tasks
