import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Search, Phone, Video, Info, MoreVertical, Plus, Users, Smile, Paperclip, ChevronLeft, Trash2, MessageCircle, Clock } from 'lucide-react';

const Avatar = ({ user, size = "10", showOnlineStatus = true }) => {
    const isOnline = user?.isOnline === true;
    const dimensionClass = `w-${size} h-${size}`;

    return (
        <div className={`relative ${dimensionClass}`}>
            {user?.profilePicture ? (
                <img
                    src={`http://localhost:8000${user.profilePicture}`}
                    alt={user?.name}
                    className={`rounded-full object-cover border-2 border-white shadow-md ${dimensionClass}`}
                />
            ) : (
                <div
                    className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md ${dimensionClass}`}
                >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
            )}

            {showOnlineStatus && isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span>
            )}
        </div>
    );
};

const MessengerApp = ({ onNotificationUpdate }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [messageMenuId, setMessageMenuId] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const jwt = localStorage.getItem('jwt');
    const searchTimeoutRef = useRef(null);

    // Récupérer les conversations
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 3000);
        return () => clearInterval(interval);
    }, []);

    // Mettre à jour les notifications quand les conversations changent
    useEffect(() => {
        const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        onNotificationUpdate?.(unreadCount);
    }, [conversations, onNotificationUpdate]);

   const fetchConversations = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/conversations', {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        if (res.ok) {
            const data = await res.json();

            // Fusionner avec l'état local pour conserver unreadCount
          setConversations(() => data);  
        }
    } catch (err) {
        console.error('Erreur lors du chargement des conversations:', err);
    }
};

// Marquer automatiquement comme lu quand on ouvre une conversation
useEffect(() => {
    if (!selectedConversation) return;

    fetch(`http://localhost:8000/api/conversations/${selectedConversation.id}/read`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
    })
    .then(() => {
        // Mise à jour du state local pour supprimer les badges non lus
        setConversations(prev =>
            prev.map(conv =>
                conv.id === selectedConversation.id
                    ? { ...conv, unreadCount: 0 }
                    : conv
            )
        );
    })
    .catch(err => console.error("Erreur mark-read:", err));
}, [selectedConversation]);


    // Récupérer les messages d'une conversation
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 2000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation]);

  const fetchMessages = async () => {
    try {
        const res = await fetch(
            `http://localhost:8000/api/conversations/${selectedConversation.id}/messages`,
            { headers: { Authorization: `Bearer ${jwt}` } }
        );
        if (!res.ok) return;

        const data = await res.json();

        setMessages(prev => {
            const lastPrev = prev[prev.length - 1];
            const lastNew  = data[data.length - 1];

            // ➤ Nouveau message reçu
            if (
                lastNew &&
                lastPrev &&
                lastNew.id !== lastPrev.id &&
                lastNew.senderId !== currentUser.id
            ) {
                // 🔥 SI LA CONVERSATION N'EST PAS OUVERTE → notification
                setConversations(prevConvs =>
                    prevConvs.map(c =>
                        c.id === selectedConversation.id
                            ? c
                            : c.id === lastNew.conversationId
                                ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
                                : c
                    )
                );
            }

            return data;
        });
    } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
    }
};

    const searchUsers = async (query) => {
        if (!query.trim()) {
            setSearchedUsers([]);
            return;
        }

        setSearchingUsers(true);
        try {
            const res = await fetch(
                `http://localhost:8000/api/users/search?q=${encodeURIComponent(query)}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            if (res.ok) {
                const data = await res.json();
                const filtered = data.filter(u => u.id !== currentUser.id);
                setSearchedUsers(filtered);
            }
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
        } finally {
            setSearchingUsers(false);
        }
    };

    const handleSearchChange = (query) => {
        setSearchUserQuery(query);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchUsers(query);
        }, 300);
    };

    const startConversation = async (userId) => {
        try {
            const res = await fetch('http://localhost:8000/api/conversations/create-or-find', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantIds: [userId] })
            });

            if (res.ok) {
                const data = await res.json();
                setShowUserSearch(false);
                setSearchUserQuery('');
                setSearchedUsers([]);
                await fetchConversations();

                setTimeout(() => {
                    const newConv = conversations.find(c => c.id === data.id);
                    if (newConv) {
                        setSelectedConversation(newConv);
                    }
                }, 500);
            }
        } catch (err) {
            console.error('Erreur lors de la création de conversation:', err);
        }
    };

    const deleteConversation = async (convId, e) => {
        e.stopPropagation();
        if (!window.confirm('Supprimer cette conversation ?')) return;

        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${convId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${jwt}` }
                }
            );

            if (res.ok) {
                setConversations(conversations.filter(c => c.id !== convId));
                if (selectedConversation?.id === convId) {
                    setSelectedConversation(null);
                }
            }
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Supprimer ce message ?')) return;

        try {
            const res = await fetch(
                `http://localhost:8000/api/messages/${messageId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${jwt}` }
                }
            );

            if (res.ok) {
                setMessages(messages.filter(m => m.id !== messageId));
                setMessageMenuId(null);
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du message:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${selectedConversation.id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: newMessage })
                }
            );

            if (res.ok) {
                setNewMessage('');
                setShowEmojiPicker(false);
                await fetchMessages();
                await fetchConversations();
            }
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message:', err);
        }
    };
    
    
    // const markMessageAsRead = async (messageId) => {
    //     try {
    //         await fetch(`http://localhost:8000/api/conversations/messages/${messageId}/read`, {
    //             method: 'POST',
    //             headers: { Authorization: `Bearer ${jwt}` },
    //         });

    //         // Mettre à jour localement pour que l'UI se mette à jour
    //         setMessages(prev =>
    //             prev.map(msg =>
    //                 msg.id === messageId ? { ...msg, isRead: true } : msg
    //             )
    //         );
    //         await fetchConversations(); // mettre à jour le badge
    //     } catch (err) {
    //         console.error('Erreur lors de la lecture du message:', err);
    //     }
    // };
    // --- UseEffect après la déclaration ---
// useEffect(() => {
//     if (!messages || messages.length === 0) return;

//     messages.forEach(msg => {
//         if (!msg.isRead && msg.senderId !== currentUser.id) {
//             markMessageAsRead(msg.id);
//         }
//     });
// }, [messages, currentUser, markMessageAsRead]);

    // const markConversationAsRead = async (convId) => {
    //     try {
    //         // NOTE: Changez ceci si votre endpoint n'est pas PATCH
    //         const res = await fetch(`http://localhost:8000/api/conversations/${convId}/read`, {
    //             method: 'PATCH', 
    //             headers: { Authorization: `Bearer ${jwt}` },
    //         });

    //         if (res.ok) {
    //             // Mise à jour de l'état local pour supprimer les indicateurs de non-lu
    //             setConversations(prev =>
    //                 prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
    //             );
    //         }
    //     } catch (err) {
    //         console.error('Erreur lors du marquage de la conversation comme lue:', err);
    //     }
    // };
    
    // NOUVELLE FONCTION pour sélectionner et marquer comme lu immédiatement
  // 🔹 Marquer la conversation comme lue et mettre à jour state local
    const handleSelectConversation = async (conv) => {
        let updatedConv = conv;

        if (conv.unreadCount > 0) {
            try {
                const res = await fetch(`http://localhost:8000/api/conversations/${conv.id}/read`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${jwt}` },
                });

                if (res.ok) {
                    // Mettre à jour le state local
                    setConversations(prev =>
                        prev.map(c =>
                            c.id === conv.id ? { ...c, unreadCount: 0 } : c
                        )
                    );

                    // Recharger la conversation mise à jour
                    updatedConv = { ...conv, unreadCount: 0 };
                }
            } catch (err) {
                console.error('Erreur lors du marquage comme lu:', err);
            }
        }

        setSelectedConversation(updatedConv);
    };



    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${selectedConversation.id}/messages/image`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${jwt}` },
                    body: formData
                }
            );

            if (res.ok) {
                await fetchMessages();
                await fetchConversations();
            }
        } catch (err) {
            console.error('Erreur lors de l\'upload:', err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants?.some(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex h-screen bg-transparent overflow-hidden pt-1">
            {/* Sidebar Conversations */}
            <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 bg-transparent flex-col border-r border-gray-200 shadow-sm`}>
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Messages
                        </h1>
                        <button
                            onClick={() => setShowUserSearch(!showUserSearch)}
                            className="p-2.5 hover:bg-gray-100 rounded-3 transition duration-200 hover:scale-110"
                            title="Nouveau message"
                        >
                            <Plus size={24} className="text-gray-700" strokeWidth={3} />
                        </button>
                    </div>

                    {!showUserSearch && (
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-4.5 text-gray-400 group-focus-within:text-purple-600 transition" />
                            <input
                                type="text"
                                placeholder="Chercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-purple-500/30 transition"
                            />
                        </div>
                    )}
                </div>

                {/* User Search Panel */}
                {showUserSearch && (
                    <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900">Nouveau message</h2>
                            <button
                                onClick={() => {
                                    setShowUserSearch(false);
                                    setSearchUserQuery('');
                                    setSearchedUsers([]);
                                }}
                                className="p-1.5 hover:bg-gray-300 rounded-3 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-4.5 text-gray-400 group-focus-within:text-purple-600 transition" />
                            <input
                                type="text"
                                placeholder="Chercher un utilisateur..."
                                value={searchUserQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                autoFocus
                                className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm focus:outline-none border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                            />
                        </div>

                        <div className="mt-4 max-h-80 overflow-y-auto space-y-1">
                            {searchingUsers && (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">Recherche en cours...</p>
                                </div>
                            )}

                            {!searchingUsers && searchUserQuery && searchedUsers.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">Aucun utilisateur trouvé</p>
                                </div>
                            )}

                            {searchedUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => startConversation(user.id)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 transition duration-150 text-left rounded-xl group"
                                >
                                    <Avatar user={user} size="12" showOnlineStatus={true} />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>

                                    <div className="text-gray-300 group-hover:text-purple-600 transition">→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                  {/* Conversations List */}
                                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                      {filteredConversations.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 mt-12">
                              <p className="text-base font-semibold text-gray-600">Aucune conversation</p>
                              <p className="text-sm mt-2 text-gray-400">Commencez à discuter</p>
                          </div>
                      ) : (
                          filteredConversations.map(conv => (
                              <div key={conv.id} className="group relative mx-3 my-1.5">
                                  
                                  <button
                                      onClick={() => handleSelectConversation(conv)}
                                      className={`w-full p-2 flex items-center gap-2 transition duration-150 text-left rounded-4
                                          ${selectedConversation?.id === conv.id ? 'bg-purple-100' : 'hover:bg-gray-100'}
                                          ${conv.unreadCount > 0 ? "font-bold" : "font-normal"}
                                      `}
                                  >
                                      <Avatar user={conv.participants[0]} size="14" showOnlineStatus={true} />

                                      <div className="flex-1 min-w-0">
                                          <h4 className="truncate text-sm text-gray-900">
                                              {conv.name}
                                          </h4>

                                          <p className="text-xs mt-0.5 truncate text-gray-600">
                                              {conv.lastMessage?.content
                                                  ? `${conv.lastMessage.senderId === currentUser.id ? "Vous" : conv.lastMessage.senderName} : ${conv.lastMessage.content.substring(0, 25)}...`
                                                  : "Aucun message"}
                                          </p>
                                      </div>

                                      <div className="flex flex-col items-end justify-center flex-shrink-0 gap-1">

                                          {/* Heure du dernier message */}
                                          <span className="text-xs text-gray-500">
                                              {conv.lastMessage?.createdAt
                                                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                  : ""}
                                          </span>

                                          {/* Petit point non lu */}
                                          {conv.unreadCount > 0 && (
                                              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                          )}

                                          {/* Badge non lu */}
                                          {conv.unreadCount > 0 && (
                                              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                  {conv.unreadCount}
                                              </span>
                                          )}
                                      </div>
                                  </button>
                              </div>
                          ))
                      )}
                  </div>

            </div>
                          {/* <button
                              onClick={(e) => deleteConversation(conv.id, e)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-red-500 rounded-full opacity-2 group-hover:opacity-100 transition duration-200 hover:bg-red-50"
                              title="Supprimer"
                          >
                              <Trash2 size={16} />
                          </button> */}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-transparent">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-transparent sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <Avatar user={selectedConversation.participants[0]} size="12" showOnlineStatus={true} />
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">
                                        {selectedConversation.name}
                                    </h2>
                                    <p className={`text-xs font-medium ${selectedConversation.participants[0]?.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                        {selectedConversation.participants[0]?.isOnline ? 'En ligne' : 'Hors ligne'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2.5 hover:bg-gray-100 rounded-3 transition duration-200 hover:scale-110">
                                    <Phone size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2.5 hover:bg-gray-100 rounded-3 transition duration-200 hover:scale-110">
                                    <Video size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2.5 hover:bg-gray-100 rounded-3 transition duration-200 hover:scale-110">
                                    <MoreVertical size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-hide">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                                        <Smile size={32} className="text-purple-600" />
                                    </div>
                                    <p className="font-semibold text-gray-600">Démarrez la conversation!</p>
                                    <p className="text-sm text-gray-500">Dites bonjour 👋</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 group ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                                        onClick={() => !msg.isOwn && !msg.isRead && markMessageAsRead(msg.id)}
                                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        {/* Indicateur visuel de non-lu dans le chat SUPPRIMÉ */}
                                        
                                        {!msg.isOwn && (
                                            <div className="w-8 h-8 flex-shrink-0">
                                                <Avatar user={selectedConversation.participants[0]} size="8" showOnlineStatus={false} />
                                            </div>
                                        )}
                                        
                                        <div className="relative max-w-ws">
                                           <div
                                                className={`px-3 py-1.5 rounded-4 shadow-sm transition hover:shadow-md
                                                ${msg.isOwn
                                                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                                  }`}
                                                  >

                                                {msg.image ? (
                                                    <img
                                                        src={`http://localhost:8000${msg.image}`}
                                                        alt="Message image"
                                                        className="max-w-xs rounded-lg"
                                                    />
                                                ) : (
                                                    <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                                                )}
                                                <p
                                                    className={`text-xs mt-1 left-2 opacity-50 ${
                                                        msg.isOwn ? 'text-blue-100' : 'text-gray-600'
                                                    }`}
                                                >
                                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>

                                            {msg.isOwn && hoveredMessageId === msg.id && (
                                                <div className="absolute -left-10 top-8  flex items-center gap-2">
                                                    <button
                                                        onClick={() => setMessageMenuId(messageMenuId === msg.id ? null : msg.id)}
                                                        className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-3 transition hover:scale-110"
                                                        title="Options"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {messageMenuId === msg.id && msg.isOwn && (
                                                <div className="absolute -left-20 top-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95">
                                                    <button
                                                        onClick={() => deleteMessage(msg.id)}
                                                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-3 transition text-sm whitespace-nowrap"
                                                    >
                                                        <Trash2 size={16} />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 bg-transparent">
                            <div className="flex items-end gap-3 relative">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 hover:bg-gray-100 rounded-full transition duration-200 hover:scale-110 flex-shrink-0"
                                >
                                    <Paperclip size={20} className="text-gray-600" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500/30 transition">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Aa"
                                        className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
                                    />
                                    <div className="relative" ref={emojiPickerRef}>
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-1 hover:bg-gray-200 rounded-full transition"
                                        >
                                            <Smile size={20} className="text-gray-600" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 right-0 z-50 animate-in fade-in zoom-in-95">
                                                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                                                    <div className="grid grid-cols-8 gap-1 p-3 w-80 max-h-64 overflow-y-auto">
                                                        {['😊', '😂', '❤️', '😍', '🎉', '🔥', '👍', '✨', '😭', '😤', '🤔', '😎', '🥳', '😘', '👏', '🎊', '💯', '🌟'].map((emoji, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => {
                                                                    setNewMessage(newMessage + emoji);
                                                                    setShowEmojiPicker(false);
                                                                }}
                                                                className="hover:bg-gray-100 p-2 rounded-lg transition text-xl hover:scale-125"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-4 transition duration-200 hover:scale-110 flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-none"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="hidden lg:flex flex-1 items-center justify-center text-gray-400 flex-col gap-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                            <Users size={48} className="text-purple-600" />
                        </div>
                        <p className="text-xl font-semibold text-gray-600">Sélectionnez une conversation</p>
                        <p className="text-base text-gray-500">Choisissez un ami pour commencer à discuter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessengerApp;