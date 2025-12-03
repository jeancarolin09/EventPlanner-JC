import React, { useEffect, useState } from 'react';
import {
  Bell, MessageCircle, Send, Trash2, Heart, Check, CheckCheck, Search,
  Clock, User, Zap, TrendingUp, MessageSquare, X, Phone, Video, MoreVertical,
  Paperclip, Smile, Pin, Archive, AlertCircle, Loader, Eye, EyeOff
} from 'lucide-react';

export default function NotificationMessagingHub() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement des activités/notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Simulation - remplacer par votre appel API
        const mockActivities = [
          {
            id: 1,
            userName: 'Alice Martin',
            action: 'a aimé votre sondage',
            type: 'like',
            time: '2m',
            read: false,
            avatar: '👩‍💼',
            pollTitle: 'Meilleur framework'
          },
          {
            id: 2,
            userName: 'Bob Johnson',
            action: 'a voté sur votre sondage',
            type: 'vote',
            time: '5m',
            read: false,
            avatar: '👨‍💻',
            pollTitle: 'Quelle heure pour travailler?'
          },
          {
            id: 3,
            userName: 'Sarah Chen',
            action: 'a commenté votre activité',
            type: 'comment',
            time: '12m',
            read: true,
            avatar: '👩‍🎨',
            comment: 'Super analyse!'
          },
          {
            id: 4,
            userName: 'David Lee',
            action: 'vous a suivi',
            type: 'follow',
            time: '1h',
            read: true,
            avatar: '👨‍🔬'
          },
          {
            id: 5,
            userName: 'Team Dev',
            action: 'a créé un nouveau sondage',
            type: 'poll',
            time: '2h',
            read: true,
            avatar: '👥',
            pollTitle: 'Stack préféré 2024'
          }
        ];
        setNotifications(mockActivities);

        // Charger les messages
        const mockMessages = [
          {
            id: 1,
            name: 'Alice Martin',
            avatar: '👩‍💼',
            lastMessage: 'À bientôt! 👋',
            time: '14:32',
            unread: 2,
            online: true,
            lastSeen: 'now'
          },
          {
            id: 2,
            name: 'Bob Johnson',
            avatar: '👨‍💻',
            lastMessage: 'D\'accord, parfait!',
            time: '14:15',
            unread: 0,
            online: false,
            lastSeen: '30m ago'
          },
          {
            id: 3,
            name: 'Group Dev',
            avatar: '👥',
            lastMessage: 'Sarah: Qui vient au standup?',
            time: '13:45',
            unread: 5,
            online: true,
            lastSeen: 'now'
          },
        ];
        setMessages(mockMessages);

        // Charger les messages du chat
        setChatMessages({
          1: [
            { id: 1, sender: 'Alice', text: 'Salut! Comment tu vas?', time: '14:20', sent: true },
            { id: 2, sender: 'You', text: 'Très bien, et toi?', time: '14:21', sent: true },
            { id: 3, sender: 'Alice', text: 'À bientôt! 👋', time: '14:32', sent: false },
          ],
          2: [
            { id: 1, sender: 'You', text: 'Salut Bob!', time: '14:10', sent: true },
            { id: 2, sender: 'Bob', text: 'D\'accord, parfait!', time: '14:15', sent: false },
          ],
        });
      } catch (err) {
        setError('Erreur lors du chargement');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: (chatMessages[selectedChat]?.length || 0) + 1,
      sender: 'You',
      text: messageInput,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sent: true
    };

    setChatMessages({
      ...chatMessages,
      [selectedChat]: [...(chatMessages[selectedChat] || []), newMessage]
    });

    setMessageInput('');
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: <Heart size={16} className="text-red-400" />,
      vote: <Zap size={16} className="text-yellow-400" />,
      comment: <MessageSquare size={16} className="text-blue-400" />,
      follow: <User size={16} className="text-purple-400" />,
      poll: <TrendingUp size={16} className="text-green-400" />,
    };
    return icons[type] || <Bell size={16} className="text-slate-400" />;
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.reduce((sum, m) => sum + m.unread, 0);

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mb-4 mx-auto" size={32} />
          <p className="text-slate-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Centre de Notifications</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Bell size={20} className="inline mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'messages'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <MessageCircle size={20} className="inline mr-2" />
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex gap-6 p-6">
        {/* Notifications Panel */}
        {activeTab === 'notifications' && (
          <div className="flex-1 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg">Aucune notification</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-400">{unreadNotifications} nouvelle(s)</p>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                      Marquer tout comme lu
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                        notif.read
                          ? 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                          : 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl mt-1">{notif.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">
                            {notif.userName}
                            <span className="text-slate-400 font-normal"> {notif.action}</span>
                          </p>
                          {notif.pollTitle && (
                            <p className="text-sm text-slate-400 mt-1">"{notif.pollTitle}"</p>
                          )}
                          {notif.comment && (
                            <p className="text-sm text-slate-300 mt-1 italic">"{notif.comment}"</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock size={14} className="text-slate-500" />
                            <span className="text-xs text-slate-500">{notif.time}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getNotificationIcon(notif.type)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Messages Panel */}
        {activeTab === 'messages' && (
          <div className="flex-1 flex gap-6 h-full">
            {/* Messages List */}
            <div className="w-80 bg-slate-800/30 rounded-xl border border-slate-700/30 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700/30">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-700/30 rounded-lg pl-10 pr-4 py-2 text-slate-300 placeholder-slate-500 border border-slate-600/30 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 p-2">
                {messages.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedChat(msg.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all group ${
                      selectedChat === msg.id
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'hover:bg-slate-700/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative text-xl">{msg.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{msg.name}</p>
                          <span className="text-xs text-slate-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{msg.lastMessage}</p>
                      </div>
                      {msg.unread > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">
                          {msg.unread}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat View */}
            {selectedChat ? (
              <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/30 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{messages.find(m => m.id === selectedChat)?.avatar}</div>
                    <div>
                      <p className="font-medium text-white">{messages.find(m => m.id === selectedChat)?.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {messages.find(m => m.id === selectedChat)?.online ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            Actif maintenant
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            {messages.find(m => m.id === selectedChat)?.lastSeen}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-700/30 rounded-lg text-slate-400 transition-all">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-700/30 rounded-lg text-slate-400 transition-all">
                      <Video size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-700/30 rounded-lg text-slate-400 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(chatMessages[selectedChat] || []).map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.sender === 'You'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-slate-700/50 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-700/30">
                  <div className="flex items-end gap-3">
                    <button className="p-2 hover:bg-slate-700/30 rounded-lg text-slate-400 transition-all">
                      <Paperclip size={20} />
                    </button>
                    <div className="flex-1 bg-slate-700/30 rounded-2xl px-4 py-2 flex items-center gap-2 border border-slate-600/30 focus-within:border-blue-500/50 transition-all">
                      <input
                        type="text"
                        placeholder="Message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none"
                      />
                      <button className="text-slate-400 hover:text-slate-300">
                        <Smile size={20} />
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white transition-all"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/30 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}