import { ArrowUpRight } from "lucide-react";
import styles from "./StatCard.module.css";

const StatCard = ({ title, count, subtitle, variant = "default", onClick }) => {
    return (
        <div
            className={`${styles.card} ${variant === "primary" ? styles.primary : ""}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <div className={styles.iconWrapper}>
                    <ArrowUpRight size={18} />
                </div>
            </div>
            <div className={styles.count}>{count}</div>
            <div className={styles.footer}>
                <span className={styles.subtitle}>{subtitle}</span>
            </div>
        </div>
    );
};

export default StatCard;
