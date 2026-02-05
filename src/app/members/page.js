import { Trash2, Edit2 } from "lucide-react";
import Header from "@/components/Header";
import styles from "./page.module.css";
import { db, schema } from "@/db";
import { ne } from "drizzle-orm";

export default async function MembersPage() {
    // Fetch users excluding 'main_team'
    const users = await db.query.users.findMany({
        where: ne(schema.users.role, 'main_team'),
    });

    // Sort: Team Leads first, then others
    const sortedUsers = users.sort((a, b) => {
        if (a.role === 'team_lead' && b.role !== 'team_lead') return -1;
        if (a.role !== 'team_lead' && b.role === 'team_lead') return 1;
        return 0;
    });

    const formatRole = (role) => {
        if (role === 'team_lead') return 'Team Lead';
        if (role === 'member') return 'Member';
        return role;
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Members" />

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
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
                            {sortedUsers.map((member) => {
                                let teams = [];
                                try {
                                    teams = member.departments ? JSON.parse(member.departments) : [];
                                } catch (e) {
                                    teams = [];
                                }

                                // Handle cases where departments might be just a string (though seed used JSON array)
                                if (typeof teams === 'string') teams = [teams];
                                if (!Array.isArray(teams)) teams = [];

                                return (
                                    <tr key={member.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}
                                                    alt={member.name}
                                                    className={styles.avatar}
                                                />
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{member.name}</span>
                                                    {/* <span className={styles.userHandle}>@{member.name.split(' ')[0].toLowerCase()}</span> */}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.roleText}>{formatRole(member.role)}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                                <span className={styles.dot}></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className={styles.email}>{member.email}</td>
                                        <td>
                                            <div className={styles.teamsCell}>
                                                {teams.map((team, index) => (
                                                    <span key={index} className={`${styles.teamBadge} ${index === 0 ? styles.primary : ''}`}>
                                                        {team}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.actionBtn}><Trash2 size={18} /></button>
                                                <button className={styles.actionBtn}><Edit2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
