"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, X } from "lucide-react";
import { getSession } from "@/lib/auth";
import styles from "./Header.module.css";

const Header = ({ title }) => {
    const [user, setUser] = useState({
        name: "User",
        email: ""
    });
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const sessionUser = getSession();
        if (sessionUser) {
            setUser(sessionUser);
            fetchNotifications();
        }
    }, []);

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

    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                <h1>{title || "Dashboard"}</h1>
            </div>

            <div className={styles.actions}>
                <button className={styles.iconButton}>
                    <Mail size={20} />
                </button>

                <button
                    className={styles.iconButton}
                    onClick={() => setShowDropdown(true)}
                >
                    <Bell size={20} />
                    {notifications.length > 0 && <span className={styles.notificationDot} />}
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
                                                        For: {notif.audienceType}
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
