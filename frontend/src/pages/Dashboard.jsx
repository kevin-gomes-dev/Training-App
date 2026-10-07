import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component is the main dashboard page that users see after logging in.
export default function Dashboard() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Training App</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Sign Out
        </button>
        <button onClick={() => navigate('/messages')} className="btn btn-secondary">
          Messages
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome{username ? `, ${username}` : ''}!</h2>
          <p>You are signed in to the Training App.</p>
        </div>
      </main>
    </div>
  );
}


