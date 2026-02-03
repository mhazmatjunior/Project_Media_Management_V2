import { Search, Mail, Bell, Command } from "lucide-react";
import styles from "./Header.module.css";

const Header = ({ title }) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                <h1>{title || "Dashboard"}</h1>
            </div>

            <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={18} />
                <input
                    type="text"
                    placeholder="Search task"
                    className={styles.searchInput}
                />
                <div className={styles.shortcutHint}>
                    <Command size={12} className={styles.cmdIcon} /> F
                </div>
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
                        <span className={styles.userName}>Totok Michael</span>
                        <span className={styles.userEmail}>tmichael20@mail.com</span>
                    </div>
                    <div className={styles.avatar}>
                        <img src="https://i.pravatar.cc/150?img=12" alt="User" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
