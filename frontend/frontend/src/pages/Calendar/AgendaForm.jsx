"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { calendarAPI } from "../../services/api"
import toast from "react-hot-toast"

const AgendaForm = ({ selectedDate, onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: selectedDate.toISOString().split("T")[0],
    },
  })

  const createAgendaMutation = useMutation({
    mutationFn: calendarAPI.createAgenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] })
      toast.success("Agenda item created successfully")
      onClose()
    },
    onError: () => {
      toast.error("Failed to create agenda item")
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    createAgendaMutation.mutate(data)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          {...register("title", { required: "Title is required" })}
          type="text"
          className="input-field mt-1"
          placeholder="Enter agenda title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="input-field mt-1"
          placeholder="Enter description (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input {...register("date", { required: "Date is required" })} type="date" className="input-field mt-1" />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time (optional)
          </label>
          <input {...register("time")} type="time" className="input-field mt-1" />
        </div>
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
          {isLoading ? "Creating..." : "Create Agenda Item"}
        </button>
      </div>
    </form>
  )
}

export default AgendaForm
