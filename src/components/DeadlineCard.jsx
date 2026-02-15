import { useState, useEffect } from "react";
import { Timer, Plus, X, Calendar, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import styles from "./DeadlineCard.module.css";

const DeadlineCard = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
    const [allUsers, setAllUsers] = useState([]); // Buffer for all users to resolve names
    const [filteredUsers, setFilteredUsers] = useState([]); // Users available for selection
    const [formData, setFormData] = useState({
        title: "",
        datetime: "",
        audienceType: "all",
        targetUsers: [],
        description: "",
    });

    const session = getSession();

    useEffect(() => {
        fetchDeadlines();
        fetchUsers();
    }, []);

    const getDepartments = (user) => {
        if (!user?.departments) return [];
        try {
            const deps = JSON.parse(user.departments);
            return Array.isArray(deps) ? deps : [deps];
        } catch (e) {
            return user.departments.split(',').map(d => d.trim());
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);

                // Filter users for selection if team_lead
                if (session?.role === 'team_lead') {
                    const leadDeps = getDepartments(session);
                    const filtered = data.filter(u => {
                        const userDeps = getDepartments(u);
                        return userDeps.some(d => leadDeps.includes(d));
                    });
                    setFilteredUsers(filtered);
                } else {
                    setFilteredUsers(data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const fetchDeadlines = async () => {
        try {
            const res = await fetch('/api/deadlines');
            if (res.ok) {
                const data = await res.json();
                setDeadlines(data);
            }
        } catch (error) {
            console.error("Failed to fetch deadlines", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.datetime) return;

        try {
            const url = editingId ? `/api/deadlines/${editingId}` : '/api/deadlines';
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
                fetchDeadlines();
                resetForm();
            }
        } catch (error) {
            console.error("Failed to save deadline", error);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteConfirmationId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmationId) return;

        try {
            const res = await fetch(`/api/deadlines/${deleteConfirmationId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchDeadlines();
                setDeleteConfirmationId(null);
            }
        } catch (error) {
            console.error("Failed to delete deadline", error);
        }
    };

    const handleEdit = (deadline) => {
        const date = new Date(deadline.datetime);
        const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

        setFormData({
            title: deadline.title,
            datetime: formattedDate,
            audienceType: deadline.audienceType,
            targetUsers: deadline.targetUsers ? JSON.parse(deadline.targetUsers) : [],
            description: deadline.description || "",
        });
        setEditingId(deadline.id);
        setIsAdding(true);
    };

    const toggleTargetUser = (userId) => {
        const id = String(userId);
        setFormData(prev => {
            const currentTargets = Array.isArray(prev.targetUsers) ? prev.targetUsers.map(String) : [];
            const newTargets = currentTargets.includes(id)
                ? currentTargets.filter(tId => tId !== id)
                : [...currentTargets, id];
            return { ...prev, targetUsers: newTargets };
        });
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ title: "", datetime: "", audienceType: "all", targetUsers: [], description: "" });
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
        <div className={`${styles.card} ${isAdding ? styles.cardAdding : ''}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>{editingId ? 'Edit Deadline' : 'Deadlines'}</h3>
                {session?.role !== 'member' && (
                    <button
                        className={styles.addButton}
                        onClick={() => isAdding ? resetForm() : setIsAdding(true)}
                    >
                        {isAdding ? <X size={18} /> : <Plus size={18} />}
                    </button>
                )}
            </div>

            <div className={styles.content}>
                {isAdding ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="text"
                            placeholder="Deadline title"
                            className={styles.input}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description (optional)"
                            className={styles.textarea}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                <option value="specific">Individual Members</option>
                            </select>
                        </div>

                        {formData.audienceType === 'specific' && (
                            <div className={styles.usersList}>
                                <div className={styles.usersListHeader}>
                                    Select Users ({formData.targetUsers.length} selected):
                                </div>
                                <div className={styles.usersGrid}>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => {
                                            const userId = String(user.id);
                                            const isSelected = Array.isArray(formData.targetUsers) &&
                                                formData.targetUsers.map(String).includes(userId);
                                            return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    className={`${styles.userSelectItem} ${isSelected ? styles.userSelected : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleTargetUser(user.id);
                                                    }}
                                                >
                                                    <div className={styles.checkbox}>
                                                        {isSelected && <Plus size={12} />}
                                                    </div>
                                                    <span className={styles.userName}>{user.name}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className={styles.emptyUsers}>
                                            {loading ? 'Loading members...' : 'No members found.'}
                                        </div>
                                    )}
                                </div>
                                {formData.targetUsers.length === 0 && (
                                    <div className={styles.errorText}>Please select at least one user</div>
                                )}
                            </div>
                        )}
                        <button type="submit" className={styles.submitButton}>
                            {editingId ? 'Update Deadline' : 'Add Deadline'}
                        </button>
                    </form>
                ) : (
                    <div className={styles.list}>
                        {loading ? (
                            <p className={styles.empty}>Loading...</p>
                        ) : deadlines.length === 0 ? (
                            <p className={styles.empty}>No deadlines yet</p>
                        ) : (
                            deadlines.map((deadline) => {
                                const { day, time } = formatDate(deadline.datetime);
                                const targetNames = getTargetNames(deadline.targetUsers);
                                const isCreator = session?.id && deadline.createdBy === session.id;

                                return (
                                    <div key={deadline.id} className={styles.deadlineItem}>
                                        <div className={styles.info}>
                                            <h4 className={styles.deadlineTitle}>{deadline.title}</h4>
                                            {deadline.description && (
                                                <p className={styles.description}>{deadline.description}</p>
                                            )}
                                            <div className={styles.timeInfo}>
                                                <span className={styles.date}>
                                                    {isToday(deadline.datetime) ? 'Today' : day}
                                                </span>
                                                <span className={styles.dot}>•</span>
                                                <span className={styles.time}>{time}</span>
                                            </div>
                                            <div className={styles.itemFooter}>
                                                <div className={styles.audienceBadge}>
                                                    For: {deadline.audienceType === 'specific' ? targetNames : deadline.audienceType}
                                                </div>
                                                {isCreator && (
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={styles.actionRaw}
                                                            onClick={() => handleEdit(deadline)}
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            className={styles.actionRaw}
                                                            onClick={() => handleDeleteClick(deadline.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {deleteConfirmationId && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h4 className={styles.modalTitle}>Delete Deadline?</h4>
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

export default DeadlineCard;
