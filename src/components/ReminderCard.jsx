import { Video, Calendar, Clock } from "lucide-react";
import styles from "./ReminderCard.module.css";

const ReminderCard = () => {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Reminders</h3>

            <div className={styles.content}>
                <div className={styles.info}>
                    <h4 className={styles.meetingTitle}>Meeting with Arc Company</h4>
                    <div className={styles.timeInfo}>
                        <span className={styles.date}>Today</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.time}>02.00 pm - 04.00 pm</span>
                    </div>
                </div>

                <button className={styles.joinButton}>
                    <Video size={18} />
                    <span>Start Meeting</span>
                </button>
            </div>
        </div>
    );
};

export default ReminderCard;
