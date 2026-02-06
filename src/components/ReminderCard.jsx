import { useState, useEffect } from "react";
import { Clock, Plus, X, Calendar } from "lucide-react";
import { getSession } from "@/lib/auth";
import styles from "./ReminderCard.module.css";

const ReminderCard = () => {
    const [reminders, setReminders] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // For specific targeting
    const [formData, setFormData] = useState({
        title: "",
        datetime: "",
        audienceType: "all",
        targetUsers: [], // Array of user IDs
    });

    const session = getSession();

    useEffect(() => {
        fetchReminders();
        // user fetch for dropdown can be added here later if needed
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await fetch('/api/reminders');
            if (res.ok) {
                const data = await res.json();
                setReminders(data);
            }
        } catch (error) {
            console.error("Failed to fetch reminders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.datetime) return;

        try {
            const res = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    createdBy: session?.id
                })
            });

            if (res.ok) {
                fetchReminders();
                setIsAdding(false);
                setFormData({ title: "", datetime: "", audienceType: "all", targetUsers: [] });
            }
        } catch (error) {
            console.error("Failed to create reminder", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), // "Thursday, Feb 6"
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) // "02:00 PM"
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
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Reminders</h3>
                <button
                    className={styles.addButton}
                    onClick={() => setIsAdding(!isAdding)}
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                </button>
            </div>

            <div className={styles.content}>
                {isAdding ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="text"
                            placeholder="Reminder title"
                            className={styles.input}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <div className={styles.row}>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={formData.datetime}
                                onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.row}>
                            <select
                                className={styles.select}
                                value={formData.audienceType}
                                onChange={(e) => setFormData({ ...formData, audienceType: e.target.value })}
                            >
                                <option value="all">All Users</option>
                                <option value="leads">Leads Only</option>
                                <option value="members">Members Only</option>
                                <option value="specific">Specific Data</option>
                            </select>
                        </div>
                        {/* Specific User Logic Placeholder - deferred */}
                        <button type="submit" className={styles.submitButton}>Add Reminder</button>
                    </form>
                ) : (
                    <div className={styles.list}>
                        {loading ? (
                            <p className={styles.empty}>Loading...</p>
                        ) : reminders.length === 0 ? (
                            <p className={styles.empty}>No reminders yet</p>
                        ) : (
                            reminders.map((reminder) => {
                                const { day, time } = formatDate(reminder.datetime);
                                return (
                                    <div key={reminder.id} className={styles.reminderItem}>
                                        <div className={styles.info}>
                                            <h4 className={styles.meetingTitle}>{reminder.title}</h4>
                                            <div className={styles.timeInfo}>
                                                <span className={styles.date}>
                                                    {isToday(reminder.datetime) ? 'Today' : day}
                                                </span>
                                                <span className={styles.dot}>•</span>
                                                <span className={styles.time}>{time}</span>
                                            </div>
                                            <div className={styles.audienceBadge}>
                                                For: {reminder.audienceType}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReminderCard;
