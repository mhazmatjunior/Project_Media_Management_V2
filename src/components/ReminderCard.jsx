import { useState, useEffect } from "react";
import { Clock, Plus, X, Calendar, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import styles from "./ReminderCard.module.css";

const ReminderCard = () => {
    const [reminders, setReminders] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
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
            const url = editingId ? `/api/reminders/${editingId}` : '/api/reminders';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    createdBy: session?.id
                })
            });

            if (res.ok) {
                fetchReminders();
                resetForm();
            }
        } catch (error) {
            console.error("Failed to save reminder", error);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteConfirmationId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmationId) return;

        try {
            const res = await fetch(`/api/reminders/${deleteConfirmationId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchReminders();
                setDeleteConfirmationId(null);
            }
        } catch (error) {
            console.error("Failed to delete reminder", error);
        }
    };

    const handleEdit = (reminder) => {
        // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
        const date = new Date(reminder.datetime);
        const formattedDate = date.toISOString().slice(0, 16); // Extract YYYY-MM-DDTHH:mm

        setFormData({
            title: reminder.title,
            datetime: formattedDate,
            audienceType: reminder.audienceType,
            targetUsers: reminder.targetUsers ? JSON.parse(reminder.targetUsers) : [],
        });
        setEditingId(reminder.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ title: "", datetime: "", audienceType: "all", targetUsers: [] });
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
                <h3 className={styles.title}>{editingId ? 'Edit Reminder' : 'Reminders'}</h3>
                <button
                    className={styles.addButton}
                    onClick={() => isAdding ? resetForm() : setIsAdding(true)}
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
                        <button type="submit" className={styles.submitButton}>
                            {editingId ? 'Update Reminder' : 'Add Reminder'}
                        </button>
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
                                            <div className={styles.itemFooter}>
                                                <div className={styles.audienceBadge}>
                                                    For: {reminder.audienceType}
                                                </div>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.actionRaw}
                                                        onClick={() => handleEdit(reminder)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        className={styles.actionRaw}
                                                        onClick={() => handleDeleteClick(reminder.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmationId && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h4 className={styles.modalTitle}>Delete Reminder?</h4>
                        <p className={styles.modalText}>This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setDeleteConfirmationId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderCard;
