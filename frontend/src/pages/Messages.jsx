// Messages page
// Left: search by exact username + conversation list
// Right: full thread with that person + send box

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const NAME_MAP_KEY = 'usernameMap';

function loadNameMap() {
  try {
    return JSON.parse(localStorage.getItem(NAME_MAP_KEY)) || {};
  } catch {
    return {};
  }
}

function saveNameMap(map) {
  localStorage.setItem(NAME_MAP_KEY, JSON.stringify(map));
}

function displayName(userId, nameMap) {
  return nameMap[userId] || `User #${userId}`;
}

export default function Messages() {
  const { token, userId, logout } = useAuth();
  const navigate = useNavigate();

  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [nameMap, setNameMap] = useState(loadNameMap);
  const [search, setSearch] = useState('');
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeUsername, setActiveUsername] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const rememberName = (id, username) => {
    if (!id || !username) return;
    setNameMap((prev) => {
      const next = { ...prev, [id]: username };
      saveNameMap(next);
      return next;
    });
  };

  const loadMessages = async () => {
    setError(null);
    try {
      const [inboxRes, sentRes] = await Promise.all([
        api.get(`/users/${userId}/messages`),
        api.get(`/users/${userId}/messages?sent=true`),
      ]);
      setInbox(Array.isArray(inboxRes.data) ? inboxRes.data : []);
      setSent(Array.isArray(sentRes.data) ? sentRes.data : []);
    } catch (err) {
      setError(err.response?.data || err.message || 'An error has occurred.');
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    if (!userId) return;
    loadMessages();
    }, [userId]);
  // Build one conversation per other user
  const conversations = useMemo(() => {
    const map = new Map();

    const add = (msg, otherId) => {
      if (!otherId || otherId === userId) return;
      const existing = map.get(otherId) || { otherId, messages: [] };
      existing.messages.push(msg);
      map.set(otherId, existing);
    };

    inbox.forEach((msg) => add(msg, msg.from_user_id));
    sent.forEach((msg) => add(msg, msg.to_user_id));

    return Array.from(map.values())
      .map((convo) => {
        const messages = [...convo.messages].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        return {
          ...convo,
          messages,
          lastDate: messages[messages.length - 1]?.date,
        };
      })
      .sort((a, b) => new Date(b.lastDate || 0) - new Date(a.lastDate || 0));
  }, [inbox, sent, userId]);

  const filteredConversations = conversations.filter((convo) => {
    const name = displayName(convo.otherId, nameMap).toLowerCase();
    return name.includes(search.trim().toLowerCase());
  });

  const activeConvo = conversations.find((c) => c.otherId === activeUserId);

  const openConversation = (otherId) => {
    setActiveUserId(otherId);
    setActiveUsername(nameMap[otherId] || '');
    setError(null);
  };

  const startByUsername = async (e) => {
    e.preventDefault();
    const username = search.trim();
    if (!username) return;

    // If we already know this username, just open that thread
    const known = Object.entries(nameMap).find(
      ([, name]) => name.toLowerCase() === username.toLowerCase()
    );
    if (known) {
      openConversation(Number(known[0]));
      return;
    }

    // No search API exists, so opening a new chat just prepares a thread.
    // The username is confirmed when the first message sends successfully.
    setActiveUserId(null);
    setActiveUsername(username);
    setError(null);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const username = activeUsername || nameMap[activeUserId];
    const text = draft.trim();
    if (!username) {
      setError('Enter a username to start a conversation.');
      return;
    }
    if (!text) return;

    setSending(true);
    setError(null);
    try {
      const { data } = await api.post(`/users/${userId}/messages`, {
        username,
        message: text,
      });

      if (data?.to_user_id) {
        rememberName(data.to_user_id, username);
        setActiveUserId(data.to_user_id);
      }

      setDraft('');
      await loadMessages();
    } catch (err) {
      const raw = err.response?.data || err.message || '';
      if (String(raw).includes("doesn't exist")) {
        setError(`No user named "${username}" was found.`);
      } else {
        setError(typeof raw === 'string' && raw ? raw : 'An error has occurred.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="messages-page">
      <header className="dashboard-header">
        <h1>Messages</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="messages-layout">
        <aside className="messages-sidebar">
          <form className="search-form" onSubmit={startByUsername}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or enter a username"
            />
            <button type="submit" className="btn btn-primary">
              Open
            </button>
          </form>
          <p className="search-hint">Search existing chats, or type an exact username and press Open.</p>

          {loading && <p className="hint">Loading conversations...</p>}

          <ul className="conversation-list">
            {filteredConversations.map((convo) => (
              <li key={convo.otherId}>
                <button
                  className={
                    convo.otherId === activeUserId
                      ? 'conversation-item active'
                      : 'conversation-item'
                  }
                  onClick={() => openConversation(convo.otherId)}
                >
                  <strong>{displayName(convo.otherId, nameMap)}</strong>
                  <span>
                    {convo.messages[convo.messages.length - 1]?.message || 'No messages yet'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="messages-thread">
          {!activeUserId && !activeUsername ? (
            <div className="thread-empty">Select a conversation or search for a username.</div>
          ) : (
            <>
              <div className="thread-header">
                {activeUsername || displayName(activeUserId, nameMap)}
              </div>

              <div className="thread-body">
                {(activeConvo?.messages || []).map((msg) => {
                  const mine = msg.from_user_id === userId;
                  return (
                    <div
                      key={msg.id}
                      className={mine ? 'bubble mine' : 'bubble theirs'}
                    >
                      <p>{msg.message}</p>
                      <small>{new Date(msg.date).toLocaleString()}</small>
                    </div>
                  );
                })}
              </div>

              {error && <div className="error-message">{error}</div>}

              <form className="composer" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeUsername || displayName(activeUserId, nameMap)}`}
                  disabled={sending}
                />
                <button className="btn btn-primary" type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}