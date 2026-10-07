import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



// This component is the main dashboard page that users see after logging in.
export default function Dashboard() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
        <header className="dashboard-header">
          <h1>Staff Step</h1>
          <div className="menu-wrap">
            <button
              className="menu-button"
              aria-label="Open menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            {menuOpen && (
              <div className="menu-dropdown">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/messages');
                  }}
                >
                  Messages
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
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


