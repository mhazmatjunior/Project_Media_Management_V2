'use client';

import React, { useState } from 'react';
import { Edit2, X, Clock, Save, Check } from "lucide-react";
import styles from "./page.module.css";

const MembersTable = ({ initialUsers, workingUserIds }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        status: 'active',
        departments: []
    });
    const [saving, setSaving] = useState(false);

    const availableDepartments = ['Research', 'Writer', 'Speaker', 'Graphics'];

    const formatRole = (role) => {
        if (role === 'team_lead') return 'Team Lead';
        if (role === 'member') return 'Member';
        return role;
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setLoading(true);
        setHistory([]);

        try {
            const res = await fetch(`/api/users/${user.id}/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (e, user) => {
        e.stopPropagation();
        let currentDeps = [];
        try {
            currentDeps = user.departments ? JSON.parse(user.departments) : [];
        } catch (e) {
            currentDeps = [];
        }
        if (typeof currentDeps === 'string') currentDeps = [currentDeps];

        setEditForm({
            status: user.status || 'active',
            departments: currentDeps.map(d => d.toLowerCase()) // normalize
        });
        setEditingUser(user);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: editForm.status,
                    departments: editForm.departments
                })
            });

            if (res.ok) {
                window.location.reload(); // Refresh to show changes
            } else {
                alert('Failed to update member');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Update failed');
        } finally {
            setSaving(false);
            setEditingUser(null);
        }
    };

    const toggleDepartment = (dept) => {
        const d = dept.toLowerCase();
        setEditForm(prev => {
            const exists = prev.departments.includes(d);
            return {
                ...prev,
                departments: exists
                    ? prev.departments.filter(x => x !== d)
                    : [...prev.departments, d]
            };
        });
    };

    const closeDialog = () => {
        setSelectedUser(null);
        setHistory([]);
    };

    const closeEditDialog = () => {
        setEditingUser(null);
    };

    return (
        <>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status ↓</th>
                            <th>Email address</th>
                            <th>Teams</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialUsers.map((member) => {
                            let teams = [];
                            try {
                                teams = member.departments ? JSON.parse(member.departments) : [];
                            } catch (e) {
                                teams = [];
                            }

                            if (typeof teams === 'string') teams = [teams];
                            if (!Array.isArray(teams)) teams = [];

                            const isWorking = workingUserIds.includes(member.id);
                            const isOffline = member.status === 'offline';

                            // Status Logic: Offline (Grey) -> Active+Working (Green) -> Idle (White/Default)
                            let statusClass = styles.statusActive;
                            let statusText = 'Idle';

                            if (isOffline) {
                                statusClass = styles.statusOffline;
                                statusText = 'Offline';
                            } else if (isWorking) {
                                statusClass = styles.statusWorking;
                                statusText = 'Active';
                            }

                            return (
                                <tr key={member.id}>
                                    <td>
                                        <div
                                            className={styles.userCell}
                                            onClick={() => handleUserClick(member)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}
                                                alt={member.name}
                                                className={styles.avatar}
                                            />
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{member.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.roleText}>{formatRole(member.role)}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${statusClass}`}>
                                            <span className={styles.dot}></span>
                                            {statusText}
                                        </span>
                                    </td>
                                    <td className={styles.email}>{member.email}</td>
                                    <td>
                                        <div className={styles.teamsCell}>
                                            {teams.map((team, index) => (
                                                <span key={index} className={styles.teamBadge}>
                                                    {team}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={(e) => handleEditClick(e, member)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* History Modal */}
            {selectedUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderLeft}>
                                <Clock size={16} className={styles.modalIcon} />
                                <h3 className={styles.modalTitle}>{selectedUser.name}'s History</h3>
                            </div>
                            <button className={styles.closeBtn} onClick={closeDialog}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {loading ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.spinner}></div>
                                    <span>Loading tasks...</span>
                                </div>
                            ) : history.length > 0 ? (
                                <div className={styles.historyList}>
                                    {history.map((item) => (
                                        <div key={item.id} className={styles.historyItem}>
                                            <div className={styles.historyTaskInfo}>
                                                <p className={styles.historyTaskTitle}>{item.videoTitle}</p>
                                                <p className={styles.historyTaskDept}>{item.department.charAt(0).toUpperCase() + item.department.slice(1)}</p>
                                            </div>
                                            <p className={styles.historyTaskDate}>
                                                {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyHistory}>
                                    No completed tasks found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className={styles.modalOverlay} style={{ zIndex: 1100 }}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderLeft}>
                                <Edit2 size={16} className={styles.modalIcon} />
                                <h3 className={styles.modalTitle}>Edit {editingUser.name}</h3>
                            </div>
                            <button className={styles.closeBtn} onClick={closeEditDialog}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    Status
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, status: 'active' }))}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: editForm.status === 'active' ? '1px solid #10B981' : '1px solid var(--border-color)',
                                            background: editForm.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                            color: editForm.status === 'active' ? '#10B981' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, status: 'offline' }))}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: editForm.status === 'offline' ? '1px solid var(--text-secondary)' : '1px solid var(--border-color)',
                                            background: editForm.status === 'offline' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                            color: editForm.status === 'offline' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Offline
                                    </button>
                                </div>
                                {editForm.status === 'offline' && (
                                    <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        Offline members are hidden from task assignment lists.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    Departments
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {availableDepartments.map(dept => {
                                        const isSelected = editForm.departments.includes(dept.toLowerCase());
                                        return (
                                            <div
                                                key={dept}
                                                onClick={() => toggleDepartment(dept)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                                                    cursor: 'pointer',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{dept}</span>
                                                {isSelected && <Check size={16} color="var(--primary-color)" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                style={{
                                    width: '100%',
                                    marginTop: '24px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <Save size={16} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MembersTable;
