"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { taskAPI } from "../../services/api"
import toast from "react-hot-toast"

const TaskForm = ({ task, onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: task
      ? {
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        }
      : {
          status: "To Do",
          priority: "Medium",
        },
  })

  const createTaskMutation = useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task created successfully")
      onClose()
    },
    onError: () => {
      toast.error("Failed to create task")
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: (data) => taskAPI.updateTask(task._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task", task._id] })
      toast.success("Task updated successfully")
      onClose()
    },
    onError: () => {
      toast.error("Failed to update task")
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)

    const taskData = {
      ...data,
      dueDate: new Date(data.dueDate).toISOString(),
    }

    if (task) {
      updateTaskMutation.mutate(taskData)
    } else {
      // For blockchain task creation, we need to use the content field
      createTaskMutation.mutate({ content: data.title })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Task Title
        </label>
        <input
          {...register("title", { required: "Task title is required" })}
          type="text"
          className="input-field mt-1"
          placeholder="Enter task title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select {...register("status", { required: "Status is required" })} className="input-field mt-1">
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select {...register("priority", { required: "Priority is required" })} className="input-field mt-1">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          {...register("dueDate", { required: "Due date is required" })}
          type="date"
          className="input-field mt-1"
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
