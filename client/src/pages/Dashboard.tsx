import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Clock, Loader2, LogOut, Plus } from 'lucide-react';
import { useTask } from '../hooks/useTasks';
import { useState } from 'react';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { format } from 'date-fns';

const statusStyles = {
    PENDING: { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
    PROCESSING: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Loader2 },
    COMPLETED: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    FAILED: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle },
};

export const Dashboard = () => {
    const { logout } = useAuth();
    const { tasks, loading, error, refetch } = useTask(1, 50);

    const [filter, setFilter] = useState<string>('ALL');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const filteredTasks = tasks.filter(t => filter === 'ALL' || t.status === filter);

    return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg"><Clock className="w-5 h-5"/></div>
            <h1 className="text-xl font-bold tracking-tight">QueueMaster</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:ring-indigo-500 outline-none border shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* Data Grid with Empty/Loading/Error States (Requirement #7) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p>Loading your queue...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" />
              <p>{error}</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No tasks found</h3>
              <p className="text-sm">Submit a new task to get the engines running.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Task ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => {
                    const StatusIcon = statusStyles[task.status].icon;
                    return (
                      <tr 
                        key={task.taskId} 
                        onClick={() => setSelectedTaskId(task.taskId)}
                        className="hover:bg-gray-50 cursor-pointer transition group"
                      >
                        <td className="px-6 py-4 font-mono text-gray-500 group-hover:text-indigo-600">{task.taskId.substring(0, 8)}...</td>
                        <td className="px-6 py-4 font-medium capitalize">{task.type}</td>
                        <td className="px-6 py-4 text-gray-500">{format(new Date(task.createdAt), 'MMM d, HH:mm:ss')}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[task.status].bg} ${statusStyles[task.status].color}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${task.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {isCreateOpen && <CreateTaskModal onClose={() => setIsCreateOpen(false)} onSuccess={refetch} />}
      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
    </div>
  )
};