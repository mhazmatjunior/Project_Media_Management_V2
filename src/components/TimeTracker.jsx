import React from 'react';
import { Play, UploadCloud } from "lucide-react";
import styles from "./TimeTracker.module.css";

const TimeTracker = ({ selectedTask }) => {
    const [elapsed, setElapsed] = React.useState("00:00:00");
    const [intervalId, setIntervalId] = React.useState(null);

    React.useEffect(() => {
        if (!selectedTask || !selectedTask.departmentEnteredAt) {
            setElapsed("Select a task");
            if (intervalId) clearInterval(intervalId);
            return;
        }

        const updateTimer = () => {
            const start = new Date(selectedTask.departmentEnteredAt).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            if (diff < 0) {
                setElapsed("00:00:00");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsed(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const id = setInterval(updateTimer, 1000);
        setIntervalId(id);

        return () => clearInterval(id);
    }, [selectedTask]);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Time Tracker</h3>
            </div>

            <div className={styles.timerDisplay}>
                {selectedTask ? (
                    <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                        {elapsed}
                    </div>
                ) : (
                    <div style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
                        Select a task to show timer
                    </div>
                )}
            </div>

            <div className={styles.controls}>
                {selectedTask ? (
                    <>
                        <button className={styles.playButton}>
                            <Play size={20} fill="currentColor" />
                        </button>
                        <button className={styles.recordButton}>
                            <div className={styles.redDot} />
                        </button>
                    </>
                ) : null}
            </div>

            {/* Abstract background shapes */}
            <div className={styles.bgShape1} />
            <div className={styles.bgShape2} />
        </div>
    );
};

export default TimeTracker;
