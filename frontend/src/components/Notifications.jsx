import { useState } from "react";
import { FiMoreVertical, FiPhone, FiSend, FiVideo } from "react-icons/fi";

export default function Notifications() {
  const [messages, setMessages] = useState([
    { text: "Generate authentic reviews and optimize your SEO—powered by AI.", time: "Yesterday, 9:00 PM", sender: "other" },
    { text: "One platform for managing reviews, boosting SEO, and growing your reputation", time: "Yesterday, 9:00 PM", sender: "other" },
  ]);
  
  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your review response was posted successfully!",
      created_at: new Date().toISOString(),
      is_read: false,
      sender_name: "System"
    },
    {
      id: 2,
      message: "New review received from John Doe",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: false,
      sender_name: "Reviews"
    },
    {
      id: 3,
      message: "Your monthly report is ready",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_read: true,
      sender_name: "Analytics"
    },
    {
      id: 4,
      message: "New feature: Automated responses are now available",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      is_read: true,
      sender_name: "Updates"
    }
  ]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const now = new Date();
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const groupNotifications = (notifications) => {
    return notifications.reduce((groups, notification) => {
      const date = formatDate(notification.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {});
  };
  
  const [newMessage, setNewMessage] = useState("");
  const [activeView, setActiveView] = useState("notifications");
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, is_read: true } 
          : n
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };
  
  const deleteNotification = (notificationId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    }
  };
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { text: newMessage, time: "Now", sender: "me" }]);
    setNewMessage("");
  };
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const groupedNotifications = groupNotifications(notifications);

  return (
    <div className="min-h-screen w-full text-white bg-transparent flex overflow-hidden max-w-full">
      <div className="flex-1 p-3 sm:p-6 transition-all duration-300 ease-in-out w-full"
      >
        {window.innerWidth < 1024 ? (
          <>
            {activeView === 'notifications' && (
              <div className="bg-[#1e1e3a] rounded-lg flex flex-col h-[92vh] overflow-hidden min-w-0">
                <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">Notifications</h2>
                  <p className="text-gray-300 text-xs sm:text-sm">Stay Updated With Your Latest Notifications</p>

                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 min-w-0">
                    <button 
                      className="px-2 sm:px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm flex-shrink-0"
                      onClick={() => setSearchQuery('')}
                    >
                      All
                    </button>
                    <button 
                      className="px-2 sm:px-3 py-1 rounded-md bg-[#111] hover:bg-[#222] text-xs sm:text-sm flex-shrink-0"
                      onClick={() => setSearchQuery('unread')}
                    >
                      Unread ({notifications.filter(n => !n.is_read).length})
                    </button>
                    <button 
                      className="px-2 sm:px-3 py-1 rounded-md bg-[#111] hover:bg-[#222] text-xs sm:text-sm flex-shrink-0"
                      onClick={markAllAsRead}
                    >
                      Mark All As Read
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide min-w-0">
                  {Object.entries(groupedNotifications).length > 0 ? (
                    Object.entries(groupedNotifications).map(([date, dateNotifications]) => {
                      let filteredNotifications = dateNotifications;
                      if (searchQuery === 'unread') {
                        filteredNotifications = dateNotifications.filter(n => !n.is_read);
                      }
                      
                      if (filteredNotifications.length === 0) return null;
                      
                      return (
                        <div key={date} className="relative mt-8 first:mt-0">
                          <h3 className="text-sm text-gray-400 mb-2 sticky top-0 bg-[#1e1e3a] py-1 z-10">
                            {date}
                          </h3>
                          <div className="space-y-3">
                            {filteredNotifications.map((notification) => (
                              <div 
                                key={notification.id}
                                className={`flex items-center justify-between rounded-lg p-3 transition-colors min-w-0 ${
                                  notification.is_read 
                                    ? 'bg-[#2a2a4a] hover:bg-[#333357]' 
                                    : 'bg-[#2a2a6a] hover:bg-[#3a3a8a]'
                                }`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium">
                                    {getInitials(notification.sender_name || 'User')}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{notification.message || 'New notification'}</p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!notification.is_read && (
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0"></div>
                                  )}
                                  <button 
                                    onClick={(e) => deleteNotification(notification.id, e)}
                                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                    title="Delete notification"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No notifications found</p>
                      {searchQuery === 'unread' && (
                        <button 
                          className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
                          onClick={() => setSearchQuery('')}
                        >
                          Show all notifications
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                  <button
                    onClick={() => setActiveView('chat')}
                    className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            )}

            {activeView === 'chat' && (
              <div className="bg-[#1e1e3a] rounded-lg flex flex-col h-[92vh] overflow-hidden min-w-0">
                <div className="flex items-center justify-between border-b border-white/10 p-4 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => setActiveView('notifications')}
                      className="p-1 hover:bg-white/10 rounded-lg lg:hidden flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="w-12 h-12 bg-gray-500 rounded-full flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">Abhishek Thakur</h3>
                      <p className="text-xs text-gray-400 truncate">Online • Last Seen 12:00 PM</p>

                    </div>
                    <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300 flex-shrink-0">
                    <FiPhone className="cursor-pointer" />
                    <FiVideo className="cursor-pointer" />
                    <FiMoreVertical className="cursor-pointer" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide min-w-0" style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm min-w-0 break-words ${
                        msg.sender === "me"
                          ? "bg-purple-600 ml-auto"
                          : "bg-[#2a2a4a] mr-auto"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="block text-xs text-gray-400 mt-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="flex items-center gap-3 border-t border-white/10 p-3 flex-shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here"
                    className="flex-1 bg-[#111] rounded-md px-3 py-2 text-sm outline-none min-w-0"
                  />
                  <button type="submit" className="bg-purple-600 p-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                    <FiSend />
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 h-[92vh] min-w-0">
            <div className="bg-[#1e1e3a] rounded-lg flex flex-col overflow-hidden min-w-0">
              <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">Notifications</h2>
                <p className="text-gray-300 text-xs sm:text-sm">Stay Updated With Your Latest Notifications</p>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 min-w-0">
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-2 sm:px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm flex-shrink-0"
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setSearchQuery('unread')}
                    className="px-2 sm:px-3 py-1 rounded-md bg-[#111] hover:bg-[#222] text-xs sm:text-sm flex-shrink-0"
                  >
                    Unread ({notifications.filter(n => !n.is_read).length})
                  </button>
                  <button 
                    onClick={markAllAsRead}
                    className="px-2 sm:px-3 py-1 rounded-md bg-[#111] hover:bg-[#222] text-xs sm:text-sm flex-shrink-0"
                  >
                    Mark All As Read
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-w-0">
                <div>
                  <h3 className="text-sm text-gray-400 mb-2 sticky top-0 bg-[#1e1e3a] py-1 z-10">Today</h3>
                  <div className="space-y-3 mb-6">
                    {notifications
                      .filter(n => searchQuery !== 'unread' || !n.is_read)
                      .slice(0, 3)
                      .map((notification) => (
                        <div 
                          key={notification.id}
                          className={`flex items-center justify-between rounded-lg p-3 transition-colors min-w-0 ${
                            notification.is_read 
                              ? 'bg-[#2a2a4a] hover:bg-[#333357]' 
                              : 'bg-[#2a2a6a] hover:bg-[#3a3a8a]'
                          }`}
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium">
                              {getInitials(notification.sender_name || 'User')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{notification.message || 'New notification'}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0"></div>
                            )}
                            <button 
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="text-gray-400 hover:text-red-400 transition-colors p-1"
                              title="Delete notification"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-gray-400 mb-2 sticky top-0 bg-[#1e1e3a] py-1 z-10">Yesterday</h3>
                  <div className="space-y-3">
                    {notifications.slice(3).map((n, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#2a2a4a] rounded-lg p-3 hover:bg-[#333357] transition-colors min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gray-500 rounded-full flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{n.text}</p>
                            <p className="text-xs text-gray-400">{n.time}</p>
                          </div>
                        </div>
                        {n.unread && <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e3a] rounded-lg flex flex-col overflow-hidden min-w-0">
              <div className="flex items-center justify-between border-b border-white/10 p-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 bg-gray-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">Abhishek Thakur</h3>
                    <p className="text-xs text-gray-400 truncate">Online • Last Seen 12:00 PM</p>
                  </div>
                  <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                </div>
                <div className="flex items-center gap-4 text-gray-300 flex-shrink-0">
                  <FiPhone className="cursor-pointer" />
                  <FiVideo className="cursor-pointer" />
                  <FiMoreVertical className="cursor-pointer" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide min-w-0" style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm min-w-0 break-words ${
                      msg.sender === "me"
                        ? "bg-purple-600 ml-auto"
                        : "bg-[#2a2a4a] mr-auto"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-xs text-gray-400 mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex items-center gap-3 border-t border-white/10 p-3 flex-shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here"
                  className="flex-1 bg-[#111] rounded-md px-3 py-2 text-sm outline-none min-w-0"
                />
                <button type="submit" className="bg-purple-600 p-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                  <FiSend />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
