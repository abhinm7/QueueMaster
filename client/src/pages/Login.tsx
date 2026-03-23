import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await apiClient.post('/auth/login', { email, password });
            login(data.accessToken);
            toast.success('Login Success!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error('Login Failed');
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="max-w-md w-full border border-b-stone-700 border-black-400 bg-white rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-100 p-3 rounded-full mb-4">
                        <LogIn className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Enter Dashboard'}
                    </button>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Need an account?{' '}
                        <Link to="/register" className="text-indigo-600 hover:underline font-medium">
                            Create one
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};