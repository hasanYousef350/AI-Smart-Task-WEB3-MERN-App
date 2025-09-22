"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { teamAPI } from "../../services/api"
import { Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

const InviteForm = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emails: [{ email: "" }],
      role: "member",
      name: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emails",
  })

  const sendInvitesMutation = useMutation({
    mutationFn: teamAPI.sendInvites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] })
      toast.success("Invitations sent successfully")
      onClose()
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to send invitations"
      toast.error(message)
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)

    const emails = data.emails.map((item) => item.email).filter((email) => email.trim())

    if (emails.length === 0) {
      toast.error("Please add at least one email address")
      setIsLoading(false)
      return
    }

    sendInvitesMutation.mutate({
      emails,
      role: data.role,
      name: data.name,
    })

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input
          {...register("name", { required: "Name is required" })}
          type="text"
          className="input-field mt-1"
          placeholder="Enter your name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <input
                {...register(`emails.${index}.email`, {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="input-field flex-1"
                placeholder="Enter email address"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ email: "" })}
          className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Add another email</span>
        </button>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select {...register("role", { required: "Role is required" })} className="input-field mt-1">
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
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
          {isLoading ? "Sending..." : "Send Invitations"}
        </button>
      </div>
    </form>
  )
}

export default InviteForm
