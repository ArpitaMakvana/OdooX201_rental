import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Clock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Account Pending</h2>
        <p className="text-sm text-gray-600 mb-6">
          Hello {user?.name}, your vendor account is currently awaiting administrator approval. 
          You will receive an email once your account has been reviewed.
        </p>
        <button
          onClick={handleLogout}
          className="text-emerald-600 font-semibold hover:underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
