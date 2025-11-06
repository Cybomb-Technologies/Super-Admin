import { useState, useEffect, useRef } from "react";
import styles from "./DjitTradingLiveChat.module.css";
import io from 'socket.io-client';

function DjitTradingLiveChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('newMessage', (data) => {
      console.log("🟡 New message received:", data);
      
      // Update chats list with new unread count
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === data.chatId 
            ? { ...chat, unreadCount: data.unreadCount, lastActivity: new Date() }
            : chat
        )
      );

      // If this chat is currently open, add the message
      if (selectedChat && selectedChat._id === data.chatId) {
        setMessages(prev => [...prev, data.message]);
        
        // Mark as read automatically when admin has the chat open
        markMessagesAsRead(data.chatId);
      }
    });

    newSocket.on('messagesRead', (data) => {
      // Update unread count when messages are read
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === data.chatId 
            ? { ...chat, unreadCount: data.unreadCount }
            : chat
        )
      );
    });

    return () => newSocket.close();
  }, [selectedChat]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== FETCH ALL CHATS =====
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/livechat/admin/chats?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setChats(data.chats);
        console.log("✅ Chats fetched:", data.chats.length);
      }
    } catch (error) {
      console.error("❌ Error fetching chats:", error);
    }
  };

  // ===== FETCH CHAT USERS FOR SIDEBAR =====
  const fetchChatUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/livechat/admin/chat-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setChats(data.users);
        console.log("✅ Chat users fetched:", data.users.length);
      }
    } catch (error) {
      console.error("❌ Error fetching chat users:", error);
    }
  };

  // ===== FETCH SPECIFIC CHAT MESSAGES =====
  const fetchChatMessages = async (chat) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/livechat/admin/chat/${chat._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSelectedChat(data.chat);
        setMessages(data.chat.messages || []);
        
        // Join socket room for this chat
        if (socket) {
          socket.emit('joinChat', data.chat._id);
        }
        
        console.log("✅ Chat messages fetched:", data.chat.messages?.length || 0);
      }
    } catch (error) {
      console.error("❌ Error fetching chat messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== MARK MESSAGES AS READ =====
  const markMessagesAsRead = async (chatId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`http://localhost:5000/api/livechat/admin/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  };

  // ===== SEND ADMIN REPLY =====
  const sendAdminReply = async () => {
    if (!replyMessage.trim() || !selectedChat) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/livechat/admin/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: replyMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setReplyMessage("");
        
        // Refresh chats list to update last activity
        fetchChatUsers();
        console.log("✅ Admin reply sent successfully");
      }
    } catch (error) {
      console.error("❌ Error sending admin reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== UPDATE CHAT STATUS =====
  const updateChatStatus = async (chatId, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/livechat/admin/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh chats list
        fetchChatUsers();
        // If currently selected chat, update its status
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(prev => ({ ...prev, status }));
        }
        console.log("✅ Chat status updated to:", status);
      }
    } catch (error) {
      console.error("❌ Error updating chat status:", error);
    }
  };

  // ===== AUTO REFRESH CHATS =====
  useEffect(() => {
    fetchChatUsers();
    
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchChatUsers, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  // ===== FORMAT DATE/TIME =====
  const formatDateTime = (dateString) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays > 1) {
      return date.toLocaleDateString();
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "Now";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ===== HANDLE KEY PRESS =====
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAdminReply();
    }
  };

  // ===== FILTER CHATS BY SEARCH =====
  const filteredChats = chats.filter(chat => {
    const userName = chat.userName || "";
    const userMobile = chat.userMobile || "";
    const userEmail = chat.userEmail || "";
    const searchLower = searchTerm.toLowerCase();
    
    return (
      userName.toLowerCase().includes(searchLower) ||
      userMobile.includes(searchTerm) ||
      userEmail.toLowerCase().includes(searchLower)
    );
  });

  // ===== GET LAST MESSAGE PREVIEW =====
  const getLastMessage = (chat) => {
    if (!chat.messages || !Array.isArray(chat.messages) || chat.messages.length === 0) {
      return "No messages yet";
    }
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage || !lastMessage.text) return "No messages yet";
    
    const preview = lastMessage.text.length > 40 
      ? lastMessage.text.substring(0, 40) + "..." 
      : lastMessage.text;
    
    return `${lastMessage.sender === "user" ? "" : "You: "}${preview}`;
  };

  // ===== GET UNREAD COUNT =====
  const getUnreadCount = (chat) => {
    return chat.unreadCount || 0;
  };

  return (
    <div className={styles.adminLiveChatContainer}>
      <div className={styles.chatLayout}>
        {/* Left Sidebar - Chat List (WhatsApp Style) */}
        <div className={styles.chatSidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>
              <h2>Live Chats</h2>
              <span className={styles.chatCount}>
                {chats.filter(chat => chat.status === "open").length}
              </span>
            </div>
            
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Status Filter Tabs - Simplified */}
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${statusFilter === "open" ? styles.active : ""}`}
                onClick={() => setStatusFilter("open")}
              >
                💬 Active Chats
              </button>
            </div>
          </div>

          <div className={styles.chatList}>
            {filteredChats.length === 0 ? (
              <div className={styles.noChats}>
                <div className={styles.noChatsIcon}>💬</div>
                <p>No {statusFilter} chats found</p>
                {searchTerm && <p>No results for "{searchTerm}"</p>}
              </div>
            ) : (
              filteredChats.map(chat => (
                <div
                  key={chat._id}
                  className={`${styles.chatItem} ${
                    selectedChat?._id === chat._id ? styles.selected : ""
                  }`}
                  onClick={() => fetchChatMessages(chat)}
                >
                  <div className={styles.chatAvatar}>
                    <div className={styles.avatar}>
                      {chat.userName ? chat.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {chat.status === "open" && getUnreadCount(chat) > 0 && (
                      <div className={styles.unreadBadge}>
                        {getUnreadCount(chat)}
                      </div>
                    )}
                  </div>

                  <div className={styles.chatContent}>
                    <div className={styles.chatHeader}>
                      <div className={styles.userInfo}>
                        <strong className={styles.userName}>
                          {chat.userName || "Unknown User"}
                        </strong>
                        <span className={styles.chatTime}>
                          {formatDateTime(chat.lastActivity)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.lastMessage}>
                      {getLastMessage(chat)}
                    </div>
                    
                    <div className={styles.chatFooter}>
                      <span className={styles.userContact}>
                        {chat.userMobile ? `📱 ${chat.userMobile}` : 'No phone'}
                        {chat.userEmail && ` • 📧 ${chat.userEmail}`}
                      </span>
                      <span className={`${styles.status} ${styles[chat.status]}`}>
                        {chat.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Messages (WhatsApp Style) */}
        <div className={styles.chatArea}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatUserInfo}>
                  <div className={styles.userAvatar}>
                    <div className={styles.avatarLarge}>
                      {selectedChat.userName ? selectedChat.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className={styles.userDetails}>
                    <h3 className={styles.userName}>{selectedChat.userName || "Unknown User"}</h3>
                    <div className={styles.userStatus}>
                      <span className={styles.userContact}>
                        {selectedChat.userMobile && `📱 ${selectedChat.userMobile}`}
                        {selectedChat.userEmail && ` • 📧 ${selectedChat.userEmail}`}
                      </span>
                      <span className={`${styles.status} ${styles[selectedChat.status]}`}>
                        {selectedChat.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.chatActions}>
                  {selectedChat.status === "open" && (
                    <button 
                      className={styles.closeBtn}
                      onClick={() => updateChatStatus(selectedChat._id, "closed")}
                      title="Close chat"
                    >
                      ❌ Close
                    </button>
                  )}
                  {selectedChat.status === "closed" && (
                    <button 
                      className={styles.reopenBtn}
                      onClick={() => updateChatStatus(selectedChat._id, "open")}
                      title="Reopen chat"
                    >
                      🔄 Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Container */}
              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <div className={styles.noMessagesIcon}>💬</div>
                    <h4>No messages yet</h4>
                    <p>Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <div className={styles.messagesList}>
                    {messages.map((msg, index) => (
                      <div
                        key={msg._id || index}
                        className={`${styles.message} ${
                          msg.sender === "admin" 
                            ? styles.adminMessage 
                            : msg.sender === "user" 
                            ? styles.userMessage 
                            : styles.botMessage
                        }`}
                      >
                        <div className={styles.messageBubble}>
                          <div className={styles.messageText}>{msg.text || "Empty message"}</div>
                          <div className={styles.messageTime}>
                            {formatMessageTime(msg.timestamp)}
                            {msg.sender === "admin" && " • You"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {isLoading && (
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Loading messages...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Section */}
              <div className={styles.replySection}>
                <div className={styles.replyInputContainer}>
                  <div className={styles.inputWrapper}>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className={styles.replyInput}
                      disabled={isLoading}
                      rows="1"
                    />
                    <button
                      onClick={sendAdminReply}
                      disabled={isLoading || !replyMessage.trim()}
                      className={styles.sendButton}
                      title="Send message"
                    >
                      {isLoading ? (
                        <div className={styles.loadingSpinner}></div>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>
              <div className={styles.noChatIcon}>💬</div>
              <h3>Welcome to Djit Trading Live Chat</h3>
              <p>Select a conversation from the sidebar to start messaging</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span>👥</span>
                  <span>View all customer chats</span>
                </div>
                <div className={styles.feature}>
                  <span>💬</span>
                  <span>Reply to user messages</span>
                </div>
                <div className={styles.feature}>
                  <span>✅</span>
                  <span>Manage chat status</span>
                </div>
                <div className={styles.feature}>
                  <span>🔔</span>
                  <span>Real-time notifications</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DjitTradingLiveChat;