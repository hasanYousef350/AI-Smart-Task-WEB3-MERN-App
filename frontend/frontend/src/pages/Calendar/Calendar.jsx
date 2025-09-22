"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Calendar from "react-calendar"
import { calendarAPI } from "../../services/api"
import { Plus, CalendarIcon, Clock, Trash2 } from "lucide-react"
import Modal from "../../components/UI/Modal"
import AgendaForm from "./AgendaForm"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"
import "react-calendar/dist/Calendar.css"

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: calendarAPI.getCalendarEvents,
  })
  const { data: agendas, isLoading: agendasLoading } = useQuery({
    queryKey: ["agendas"],
    queryFn: calendarAPI.getAgendas,
  })

  const deleteAgendaMutation = useMutation({
    mutationFn: calendarAPI.deleteAgenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] })
      toast.success("Agenda item deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete agenda item")
    },
  })

  const handleDeleteAgenda = (id) => {
    if (window.confirm("Are you sure you want to delete this agenda item?")) {
      deleteAgendaMutation.mutate(id)
    }
  }

  if (eventsLoading || agendasLoading) {
    return <LoadingSpinner />
  }

  const eventData = events?.data || []
  const agendaData = agendas?.data || []

  // Filter agendas for selected date
  const selectedDateAgendas = agendaData.filter((agenda) => {
    const agendaDate = new Date(agenda.date)
    return agendaDate.toDateString() === selectedDate.toDateString()
  })

  // Get events for selected date
  const selectedDateEvents = eventData.filter((event) => {
    const eventDate = new Date(event.start)
    return eventDate.toDateString() === selectedDate.toDateString()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and agenda</p>
        </div>
        <button onClick={() => setIsAgendaModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Agenda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h2>
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full"
                tileContent={({ date, view }) => {
                  if (view === "month") {
                    const hasEvents = eventData.some(
                      (event) => new Date(event.start).toDateString() === date.toDateString(),
                    )
                    const hasAgendas = agendaData.some(
                      (agenda) => new Date(agenda.date).toDateString() === date.toDateString(),
                    )

                    if (hasEvents || hasAgendas) {
                      return (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )
                    }
                  }
                  return null
                }}
              />
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {/* Events */}
            {selectedDateEvents.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Events
                </h4>
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900">{event.title}</h5>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(event.start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {event.end && (
                          <span>
                            {" - "}
                            {new Date(event.end).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agendas */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Agenda Items
                </span>
                <button
                  onClick={() => setIsAgendaModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Add Item
                </button>
              </h4>

              {selectedDateAgendas.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateAgendas.map((agenda) => (
                    <div key={agenda._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{agenda.title}</h5>
                          {agenda.description && <p className="text-sm text-gray-600 mt-1">{agenda.description}</p>}
                          {agenda.time && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {agenda.time}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteAgenda(agenda._id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          disabled={deleteAgendaMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No agenda items for this date</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Agenda Modal */}
      <Modal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        title="Add Agenda Item"
        size="large"
      >
        <AgendaForm selectedDate={selectedDate} onClose={() => setIsAgendaModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default CalendarPage
