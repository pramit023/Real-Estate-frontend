import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { HiChatAlt2, HiPaperAirplane, HiTrash, HiUser } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SellerMessages = () => {
  const { token, user } = useAuth();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(() => location.state?.chat?._id || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const selectedChat = chats.find((chat) => chat._id === selectedChatId) || chats[0];

  const loadChats = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${API_URL}/api/chat/user`, { headers });
      const nextChats = res.data.chats || res.data || [];
      setChats(nextChats);
      setSelectedChatId((current) => current || nextChats[0]?._id || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load messages.');
    } finally {
      setLoading(false);
    }
  }, [headers, token]);

  useEffect(() => {
    queueMicrotask(loadChats);
  }, [loadChats]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedChat || !message.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/chat/send`, {
        chatId: selectedChat._id,
        text: message.trim(),
      }, { headers });

      const updatedChat = res.data.chat;
      setChats((prev) => prev.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat)));
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (chatId) => {
    if (!window.confirm('Delete this conversation?')) return;

    try {
      await axios.delete(`${API_URL}/api/chat/${chatId}`, { headers });
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      setSelectedChatId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete conversation.');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main mb-1">Messages</h1>
        <p className="text-text-muted text-sm">Reply to buyers and keep property conversations in one place.</p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {loading ? (
        <div className="card-premium p-8 text-center">
          <div className="loader mx-auto mb-4" />
          <p>Loading messages...</p>
        </div>
      ) : chats.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <HiChatAlt2 className="mx-auto mb-4 h-16 w-16 text-[#cbd5e1]" />
          <h2 className="mb-2 text-xl font-bold text-text-main">No Messages Yet</h2>
          <p className="text-text-muted">Buyer conversations will appear here after a chat is started.</p>
        </div>
      ) : (
        <div className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white lg:grid-cols-[340px_1fr]">
          <aside className="border-b border-[#e2e8f0] lg:border-b-0 lg:border-r">
            {chats.map((chat) => {
              const lastMessage = chat.messages?.[chat.messages.length - 1];
              const buyerName = chat.buyer?.name || 'Buyer';
              const isActive = selectedChat?._id === chat._id;

              return (
                <button
                  key={chat._id}
                  type="button"
                  onClick={() => setSelectedChatId(chat._id)}
                  className={`w-full border-b border-[#f1f5f9] p-4 text-left transition hover:bg-[#f8fafc] ${isActive ? 'bg-primary-light' : 'bg-white'}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text-main">{buyerName}</p>
                      <p className="truncate text-xs text-text-muted">{chat.property?.title || 'Property chat'}</p>
                    </div>
                    <span className="shrink-0 text-[0.7rem] text-text-muted">{formatTime(lastMessage?.createdAt)}</span>
                  </div>
                  <p className="truncate text-sm text-[#64748b]">{lastMessage?.text || 'No messages yet'}</p>
                </button>
              );
            })}
          </aside>

          <section className="flex min-h-[620px] flex-col">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <HiUser />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-text-main">{selectedChat?.buyer?.name || 'Buyer'}</h2>
                  <p className="truncate text-sm text-text-muted">{selectedChat?.property?.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(selectedChat._id)}
                className="btn bg-[#fff5f5] p-3 text-[#dc2626] hover:bg-[#fee2e2]"
                title="Delete conversation"
              >
                <HiTrash />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8fafc] p-5">
              {selectedChat?.messages?.length ? selectedChat.messages.map((item) => {
                const fromMe = item.sender?._id === user?._id || item.sender === user?._id;
                return (
                  <div key={item._id || item.createdAt} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${fromMe ? 'bg-primary text-white' : 'bg-white text-text-main border border-[#e2e8f0]'}`}>
                      <p className="break-words text-sm">{item.text}</p>
                      <p className={`mt-1 text-[0.7rem] ${fromMe ? 'text-white/70' : 'text-text-muted'}`}>{formatTime(item.createdAt)}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex h-full items-center justify-center text-text-muted">No messages in this conversation.</div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-3 border-t border-[#e2e8f0] p-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none focus:border-primary"
                placeholder="Write a reply..."
              />
              <button type="submit" disabled={sending || !message.trim()} className="btn btn-primary px-5">
                <HiPaperAirplane />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default SellerMessages;
