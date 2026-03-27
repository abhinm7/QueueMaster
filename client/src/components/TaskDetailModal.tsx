import { X, Loader } from 'lucide-react';
import { useTaskDetail } from '../hooks/useTaskDetail';

interface Props {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailModal = ({ taskId, onClose }: Props) => {
  const { task, loading, error } = useTaskDetail(taskId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h3 className="font-semibold text-lg">Task Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-md"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}
          
          {loading && !task && (
             <div className="flex flex-col items-center justify-center py-12 text-gray-500">
               <Loader className="w-8 h-8 animate-spin mb-2" />
               <p>Fetching details...</p>
             </div>
          )}

          {task && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">ID</span>
                  <p className="font-mono text-sm mt-1">{task.taskId}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</span>
                  <p className="font-semibold mt-1">{task.status}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Input Payload</span>
                <pre className=" p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  {JSON.stringify(task.payload, null, 2)}
                </pre>
              </div>

              {task.result && (
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Execution Result</span>
                  <div className={`p-4 rounded-lg font-mono text-sm ${task.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {task.result}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};