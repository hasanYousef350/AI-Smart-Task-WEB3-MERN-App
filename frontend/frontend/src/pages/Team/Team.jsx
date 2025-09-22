"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { teamAPI } from "../../services/api"
import { Plus, Mail, Users, Crown, User } from "lucide-react"
import Modal from "../../components/UI/Modal"
import InviteForm from "./InviteForm"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

const Team = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: teamAPI.getTeamMembers,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  const members = teamMembers?.data || []

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "manager":
        return <Users className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-yellow-100 text-yellow-800",
      manager: "bg-blue-100 text-blue-800",
      member: "bg-gray-100 text-gray-800",
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || colors.member}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">Manage your team and send invitations</p>
        </div>
        <button onClick={() => setIsInviteModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Invite Members</span>
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{members.filter((m) => m.role === "admin").length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>

        {members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getRoleIcon(member.role)}
                  {getRoleBadge(member.role)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No team members yet</p>
            <button onClick={() => setIsInviteModalOpen(true)} className="btn-primary">
              Invite your first team member
            </button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Members"
        size="large"
      >
        <InviteForm onClose={() => setIsInviteModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default Team
