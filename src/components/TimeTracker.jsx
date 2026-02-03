import { Play, UploadCloud } from "lucide-react";
import styles from "./TimeTracker.module.css";

const TimeTracker = () => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Time Tracker</h3>
            </div>

            <div className={styles.timerDisplay}>
                <span>01</span>:<span>24</span>:<span>08</span>
            </div>

            <div className={styles.controls}>
                <button className={styles.playButton}>
                    <Play size={20} fill="currentColor" />
                </button>
                <button className={styles.recordButton}>
                    <div className={styles.redDot} />
                </button>
            </div>

            {/* Abstract background shapes */}
            <div className={styles.bgShape1} />
            <div className={styles.bgShape2} />
        </div>
    );
};

export default TimeTracker;
