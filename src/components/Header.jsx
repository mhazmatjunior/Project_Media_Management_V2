"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, X, Menu, Timer } from "lucide-react";
import { getSession } from "@/lib/auth";
import { useChat } from "@/context/ChatContext";
import { useSidebar } from "@/context/SidebarContext";
import DeadlineCard from "./DeadlineCard";
import styles from "./Header.module.css";

const Header = ({ title }) => {
    const [user, setUser] = useState({
        name: "User",
        email: ""
    });
    const [notifications, setNotifications] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeadlinesDropdown, setShowDeadlinesDropdown] = useState(false);
    const [isManageDeadlinesOpen, setIsManageDeadlinesOpen] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);
    const { toggleChat, totalUnread } = useChat();
    const { isMobile, toggleMobileSidebar } = useSidebar();

    useEffect(() => {
        const sessionUser = getSession();
        if (sessionUser) {
            setUser(sessionUser);
            fetchNotifications();
            fetchDeadlines();
            fetchUsersServer();
        }
    }, []);

    const fetchUsersServer = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/reminders/my');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const fetchDeadlines = async () => {
        try {
            const res = await fetch('/api/deadlines/my');
            if (res.ok) {
                const data = await res.json();
                setDeadlines(data);
                checkDeadlinesUrgency(data);
            }
        } catch (error) {
            console.error("Failed to fetch deadlines", error);
        }
    };

    const checkDeadlinesUrgency = (deadlineList) => {
        const now = new Date();
        const sixHoursInMs = 6 * 60 * 60 * 1000;

        const urgent = deadlineList.some(d => {
            const deadlineTime = new Date(d.datetime);
            const diff = deadlineTime - now;
            return diff > 0 && diff <= sixHoursInMs;
        });

        setIsUrgent(urgent);
    };

    // DEBUG: Connection Status
    const [connectionState, setConnectionState] = useState('disconnected');
    useEffect(() => {
        const { pusherClient } = require('@/lib/pusher');
        if (!pusherClient) {
            setConnectionState('missing_env');
            return;
        }

        pusherClient.connection.bind('state_change', (states) => {
            setConnectionState(states.current);
        });
        // Initial state
        setConnectionState(pusherClient.connection.state);
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getTargetNames = (targetUsersJson) => {
        if (!targetUsersJson) return '';
        try {
            const targetIds = JSON.parse(targetUsersJson).map(String);
            return allUsers
                .filter(u => targetIds.includes(String(u.id)))
                .map(u => u.name)
                .join(', ');
        } catch (e) {
            return '';
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                {isMobile && (
                    <button onClick={toggleMobileSidebar} className={styles.menuButton}>
                        <Menu size={24} />
                    </button>
                )}
                <h1>{title || "Dashboard"}</h1>
                {/* Debug Indicator */}
                <div
                    title={`Chat Status: ${connectionState}`}
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor:
                            connectionState === 'connected' ? '#4caf50' :
                                (connectionState === 'connecting' ? '#ff9800' :
                                    (connectionState === 'missing_env' ? '#9e9e9e' : '#f44336')),
                        marginLeft: '10px',
                        display: 'inline-block'
                    }}
                />
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.iconButton}
                    onClick={() => setShowDropdown(true)}
                    title="Reminders"
                >
                    <Bell size={20} />
                    {notifications.length > 0 && <span className={styles.notificationDot} />}
                </button>

                <button
                    className={`${styles.iconButton} ${isUrgent ? styles.blinking : ''}`}
                    onClick={() => setShowDeadlinesDropdown(true)}
                    title="Deadlines"
                >
                    <Timer size={20} />
                    {deadlines.length > 0 && <span className={styles.notificationDot} />}
                </button>

                <button className={styles.iconButton} onClick={toggleChat} title="Messages">
                    <Mail size={20} />
                    {totalUnread > 0 && <span className={styles.notificationDot} />}
                </button>

                {showDropdown && (
                    <div className={styles.modalOverlay} onClick={() => setShowDropdown(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Reminders</h3>
                                <button className={styles.closeButton} onClick={() => setShowDropdown(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.notificationList}>
                                {notifications.length > 0 ? (
                                    notifications.map(notif => {
                                        const { day, time } = formatDate(notif.datetime);
                                        const targetNames = getTargetNames(notif.targetUsers);
                                        return (
                                            <div key={notif.id} className={styles.notificationItem}>
                                                <h4 className={styles.meetingTitle}>{notif.title}</h4>
                                                <div className={styles.timeInfo}>
                                                    <span className={styles.date}>
                                                        {isToday(notif.datetime) ? 'Today' : day}
                                                    </span>
                                                    <span className={styles.dot}>•</span>
                                                    <span className={styles.time}>{time}</span>
                                                </div>
                                                <div className={styles.itemFooter}>
                                                    <div className={styles.audienceBadge}>
                                                        For: {notif.audienceType === 'specific' ? targetNames : notif.audienceType}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={styles.emptyState}>No reminders</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showDeadlinesDropdown && (
                    <div className={styles.modalOverlay} onClick={() => setShowDeadlinesDropdown(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Deadlines</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            setShowDeadlinesDropdown(false);
                                            setIsManageDeadlinesOpen(true);
                                        }}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            background: 'var(--primary-color)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add/Manage
                                    </button>
                                    <button className={styles.closeButton} onClick={() => setShowDeadlinesDropdown(false)}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.notificationList}>
                                {deadlines.length > 0 ? (
                                    deadlines.map(deadline => {
                                        const { day, time } = formatDate(deadline.datetime);
                                        const deadlineTime = new Date(deadline.datetime);
                                        const now = new Date();
                                        const diff = deadlineTime - now;
                                        const isWithin6Hours = diff > 0 && diff <= 6 * 60 * 60 * 1000;
                                        const targetNames = getTargetNames(deadline.targetUsers);

                                        return (
                                            <div key={deadline.id} className={`${styles.notificationItem} ${isWithin6Hours ? styles.urgentDeadline : ''}`}>
                                                <h4 className={styles.meetingTitle}>{deadline.title}</h4>
                                                {deadline.description && (
                                                    <p className={styles.deadlineDesc}>{deadline.description}</p>
                                                )}
                                                <div className={styles.timeInfo}>
                                                    <span className={styles.date}>
                                                        {isToday(deadline.datetime) ? 'Today' : day}
                                                    </span>
                                                    <span className={styles.dot} style={isWithin6Hours ? { color: '#EF4444' } : {}}>•</span>
                                                    <span className={styles.time}>{time}</span>
                                                </div>
                                                <div className={styles.itemFooter}>
                                                    <div className={styles.audienceBadge}>
                                                        For: {deadline.audienceType === 'specific' ? targetNames : deadline.audienceType}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={styles.emptyState}>No deadlines yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isManageDeadlinesOpen && (
                    <div className={styles.modalOverlay} onClick={() => {
                        setIsManageDeadlinesOpen(false);
                        fetchDeadlines(); // Refresh on close
                    }}>
                        <div
                            style={{
                                width: '500px',
                                maxHeight: '90vh',
                                background: '#121212',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid #333'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <DeadlineCard />
                        </div>
                    </div>
                )}

                <div className={styles.profile}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                    </div>
                    <div className={styles.avatar}>
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D32F2F&color=fff`}
                            alt={user.name}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
