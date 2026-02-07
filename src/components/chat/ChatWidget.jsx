"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { X, Send, Hash, User, ChevronLeft } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { getSession } from "@/lib/auth"; // Assume this gets client-side session or we pass it
import styles from "./ChatWidget.module.css";

const GROUPS = [
    { id: 'main', name: 'Main Team' },
    { id: 'research', name: 'Research Team' },
    { id: 'writer', name: 'Writer Team' },
    { id: 'speaker', name: 'Speaker Team' },
    { id: 'graphic', name: 'Graphic Team' },
];

const ChatWidget = () => {
    const { isOpen, toggleChat, activeChat, setActiveChat, setTotalUnread } = useChat();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [users, setUsers] = useState([]); // List of users for DMs
    const [currentUser, setCurrentUser] = useState(null);
    const [unread, setUnread] = useState({});

    // Sync total unread count to context for Header
    useEffect(() => {
        setTotalUnread(Object.keys(unread).length);
    }, [unread, setTotalUnread]);

    const messagesEndRef = useRef(null);

    // Keep activeChat in a ref to access it inside Pusher callbacks
    const activeChatRef = useRef(activeChat);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Keep isOpen in a ref to access it inside Pusher callbacks
    const isOpenRef = useRef(isOpen);
    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen]);

    // Initial Load
    useEffect(() => {
        const user = getSession();
        if (user) setCurrentUser(user);
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                const others = data.filter(u => u.id !== currentUser?.id);
                setUsers(others);
            }
        } catch (e) { console.error("Failed to fetch users", e) }
    };

    const fetchUnread = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch(`/api/chat/unread?userId=${currentUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setUnread(prev => ({ ...prev, ...data }));
            }
        } catch (e) { console.error("Failed to fetch unread", e) }
    };

    // Global Listener (Groups + DM Notifications)
    // Runs once on mount (or user change), DOES NOT re-subscribe on activeChat change
    useEffect(() => {
        if (!currentUser) return;

        if (!pusherClient) {
            console.error("PUSHER CLIENT NOT INITIALIZED. Check NEXT_PUBLIC_PUSHER_KEY");
            return;
        }

        // Debug Connection
        pusherClient.connection.bind('state_change', (states) => {
            console.log("Pusher connection state:", states.current);
        });

        pusherClient.connection.bind('error', (err) => {
            console.error("Pusher connection error:", err);
        });

        // Fetch initial unread status
        fetchUnread();

        const subscriptions = [];

        // 1. User Channel (for DM Notifications)
        const userChannelName = `user-${currentUser.id}`;
        const userChannel = pusherClient.subscribe(userChannelName);
        userChannel.bind('new-message', (data) => {
            if (data.senderId === currentUser.id) return;

            // Check Ref, not state
            const current = activeChatRef.current;
            const isCurrentChat = isOpenRef.current && current?.type === 'dm' && current.id === data.senderId;

            if (!isCurrentChat) {
                setUnread(prev => ({ ...prev, [`dm-${data.senderId}`]: true }));
            } else {
                // If it IS current chat, IGNORE it here. 
                // The Specific Listener (below) will handle the append. 
                // This prevents duplicates.
            }
        });
        subscriptions.push(userChannelName);

        // 2. Group Channels (Notifications AND Messages)
        GROUPS.forEach(g => {
            const groupChannelName = `chat-group-${g.id}`;
            const groupChannel = pusherClient.subscribe(groupChannelName);
            groupChannel.bind('new-message', (data) => {
                if (data.senderId === currentUser.id) return;

                const current = activeChatRef.current;
                const isCurrentChat = isOpenRef.current && current?.type === 'group' && current.id === g.id;

                if (!isCurrentChat) {
                    setUnread(prev => ({ ...prev, [`group-${g.id}`]: true }));
                } else {
                    // For Groups, we rely ONLY on this global listener
                    setMessages(prev => [...prev, data]);
                    scrollToBottom();
                }
            });
            subscriptions.push(groupChannelName);
        });

        return () => {
            subscriptions.forEach(ch => pusherClient.unsubscribe(ch));
        };
    }, [currentUser]); // Depend only on currentUser

    // Fetch History when Chat Changes
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        // Clear unread
        const key = activeChat.type === 'group' ? `group-${activeChat.id}` : `dm-${activeChat.id}`;
        setUnread(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

        const fetchHistory = async () => {
            let url = `/api/chat/history?`;
            if (activeChat.type === 'group') {
                url += `channel=${activeChat.id}`;
            } else {
                url += `userId1=${currentUser.id}&userId2=${activeChat.id}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
            }
        };

        fetchHistory();
    }, [activeChat, currentUser]);

    // Specific Listener (DMs ONLY)
    // We do NOT listen to Groups here, because Global Listener handles them.
    useEffect(() => {
        if (!activeChat || !currentUser || !pusherClient) return;
        if (activeChat.type === 'group') return; // Skip Groups

        // DMs only
        const ids = [currentUser.id, activeChat.id].sort((a, b) => a - b);
        const channelName = `chat-dm-${ids[0]}-${ids[1]}`;

        const channel = pusherClient.subscribe(channelName);
        channel.bind('new-message', (data) => {
            if (data.senderId === currentUser.id) return;
            setMessages((prev) => [...prev, data]);
            scrollToBottom();
        });

        return () => {
            pusherClient.unsubscribe(channelName);
        };
    }, [activeChat, currentUser]);


    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const payload = {
            content: newMessage,
            currentUserId: currentUser.id,
            channel: activeChat.type === 'group' ? activeChat.id : undefined,
            receiverId: activeChat.type === 'dm' ? activeChat.id : undefined,
            senderId: currentUser.id,
            senderName: currentUser.name,
        };

        // Optimistic UI update
        const optimisticMsg = {
            ...payload,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();
        setNewMessage("");

        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend(e);
        }
    }; if (!isOpen) return null;

    return (
        <div className={styles.widgetContainer}>
            {/* Header */}
            <div className={styles.header}>
                {activeChat ? (
                    <div className={styles.headerTitle}>
                        <button onClick={() => setActiveChat(null)} className={styles.backButton}>
                            <ChevronLeft size={18} />
                        </button>
                        <span>{activeChat.name}</span>
                    </div>
                ) : (
                    <div className={styles.headerTitle}>Messages</div>
                )}
                <button onClick={toggleChat} className={styles.closeButton}>
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {!activeChat ? (
                    // Connection List
                    <div className={styles.listContainer}>
                        <div className={styles.sectionHeader}>Groups</div>
                        {GROUPS.map(g => (
                            <div key={g.id} className={styles.listItem} onClick={() => setActiveChat({ type: 'group', ...g })}>
                                <div className={styles.iconBg}><Hash size={16} /></div>
                                <span>{g.name}</span>
                                {unread[`group-${g.id}`] && <div className={styles.unreadBadge} />}
                            </div>
                        ))}

                        <div className={styles.sectionHeader}>Direct Messages</div>
                        {users.map(u => (
                            <div key={u.id} className={styles.listItem} onClick={() => setActiveChat({ type: 'dm', id: u.id, name: u.name })}>
                                <div className={styles.iconBg}><User size={16} /></div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{u.name}</span>
                                    <span style={{ fontSize: '10px', color: '#666' }}>{u.role}</span>
                                </div>
                                {unread[`dm-${u.id}`] && <div className={styles.unreadBadge} />}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Chat Window
                    <div className={styles.chatWindow}>
                        <div className={styles.messagesList}>
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={idx} className={`${styles.messageBubble} ${isMe ? styles.me : styles.them}`}>
                                        <div className={styles.bubbleContent}>
                                            {!isMe && activeChat.type === 'group' && <div className={styles.senderName}>{msg.senderName}</div>}
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSend} className={styles.inputArea}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={styles.input}
                            />
                            <button type="submit" className={styles.sendButton}>
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;
