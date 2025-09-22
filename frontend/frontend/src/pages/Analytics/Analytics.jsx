import { useQuery } from "@tanstack/react-query"
import { analyticsAPI, taskAPI } from "../../services/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CheckSquare, Clock, AlertCircle, Target } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

const Analytics = () => {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsAPI.getAnalyticsData,
  })
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskAPI.getAllTasks,
  })

  if (analyticsLoading || tasksLoading) {
    return <LoadingSpinner />
  }

  const analyticsData = analytics?.data || {}
  const taskData = tasks?.data || []

  // Prepare chart data
  const statusData = [
    { name: "To Do", value: analyticsData.statusCounts?.["To Do"] || 0, color: "#6B7280" },
    { name: "In Progress", value: analyticsData.statusCounts?.["In Progress"] || 0, color: "#F59E0B" },
    { name: "Completed", value: analyticsData.statusCounts?.["Completed"] || 0, color: "#10B981" },
  ]

  const priorityData = [
    { name: "High", value: analyticsData.priorityCounts?.["High"] || 0, color: "#EF4444" },
    { name: "Medium", value: analyticsData.priorityCounts?.["Medium"] || 0, color: "#F59E0B" },
    { name: "Low", value: analyticsData.priorityCounts?.["Low"] || 0, color: "#10B981" },
  ]

  // Calculate completion rate
  const totalTasks = taskData.length
  const completedTasks = analyticsData.statusCounts?.["Completed"] || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate overdue tasks
  const overdueTasks = taskData.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "Completed",
  ).length

  const stats = [
    {
      name: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Completion Rate",
      value: `${completionRate}%`,
      icon: Target,
      color: "bg-green-500",
      change: "+5%",
      changeType: "positive",
    },
    {
      name: "In Progress",
      value: analyticsData.statusCounts?.["In Progress"] || 0,
      icon: Clock,
      color: "bg-yellow-500",
      change: "+3%",
      changeType: "positive",
    },
    {
      name: "Overdue",
      value: overdueTasks,
      icon: AlertCircle,
      color: "bg-red-500",
      change: "-2%",
      changeType: "negative",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your productivity and task performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taskData.slice(0, 10).map((task) => (
                <tr key={task._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
