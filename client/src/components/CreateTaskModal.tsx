import { useState } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTaskModal = ({ onClose, onSuccess }: Props) => {
  const [type, setType] = useState('export');
  const [payloadStr, setPayloadStr] = useState('{\n  "target": "sales_data_2026"\n}');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate JSON before sending to backend
      const payload = JSON.parse(payloadStr); 
      await apiClient.post('/tasks', { type, payload });
      toast.success('Task successfully queued!');
      onSuccess(); // Triggers a refetch on the dashboard
      onClose();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON payload. Please fix the formatting.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit task');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">Submit New Task</h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-md"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:border-indigo-500">
              <option value="export">Export</option>
              <option value="report">Report</option>
              <option value="import">Import</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
            <textarea 
              value={payloadStr} onChange={(e) => setPayloadStr(e.target.value)} rows={5}
              className="w-full border rounded-lg p-2 font-mono text-sm outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
            {loading ? 'Submitting...' : 'Add to Queue'}
          </button>
        </form>
      </div>
    </div>
  );
};