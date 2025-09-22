import { useQuery } from "@tanstack/react-query"
import { taskAPI, analyticsAPI } from "../../services/api"
import { CheckSquare, Clock, AlertCircle } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

const Dashboard = () => {
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskAPI.getAllTasks,
  })
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsAPI.getAnalyticsData,
  })

  if (tasksLoading || analyticsLoading) {
    return <LoadingSpinner />
  }

  const taskData = tasks?.data || []
  const analyticsData = analytics?.data || {}

  const stats = [
    {
      name: "Total Tasks",
      value: taskData.length,
      icon: CheckSquare,
      color: "bg-blue-500",
    },
    {
      name: "In Progress",
      value: analyticsData.statusCounts?.["In Progress"] || 0,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      name: "Completed",
      value: analyticsData.statusCounts?.["Completed"] || 0,
      icon: CheckSquare,
      color: "bg-green-500",
    },
    {
      name: "High Priority",
      value: analyticsData.priorityCounts?.["High"] || 0,
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ]

  const recentTasks = taskData.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all</button>
        </div>

        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      task.priority === "High"
                        ? "bg-red-500"
                        : task.priority === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
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
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No tasks found. Create your first task!</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
