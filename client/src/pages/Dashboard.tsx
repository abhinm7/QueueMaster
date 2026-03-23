import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Task Queue System</h1>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};