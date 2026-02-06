"use client";

import { useState, useEffect } from "react";
import { Mail, Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import styles from "./Header.module.css";

const Header = ({ title }) => {
    const [user, setUser] = useState({
        name: "User",
        email: ""
    });

    useEffect(() => {
        const sessionUser = getSession();
        if (sessionUser) {
            setUser(sessionUser);
        }
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                <h1>{title || "Dashboard"}</h1>
            </div>

            <div className={styles.actions}>
                <button className={styles.iconButton}>
                    <Mail size={20} />
                </button>
                <button className={styles.iconButton}>
                    <Bell size={20} />
                    <span className={styles.notificationDot} />
                </button>

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
