import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { db, schema } from "@/db";
import { eq, ne, and, sql } from "drizzle-orm";
import styles from "./page.module.css";

export default async function LeaderboardPage({ searchParams }) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    let userRole = null;
    let currentUserId = null;
    let userDepartments = [];

    try {
        const session = JSON.parse(sessionCookie.value);
        userRole = session.role;
        currentUserId = session.id;

        // Fetch user's full details to get latest departments
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, currentUserId),
            columns: { departments: true }
        });

        if (user && user.departments) {
            try {
                userDepartments = JSON.parse(user.departments);
            } catch (e) {
                userDepartments = user.departments.split(',').map(d => d.trim());
            }
        }
    } catch (e) {
        redirect('/');
    }

    const allDepartments = ['Research', 'Writer', 'Speaker', 'Video', 'Graphics'];
    let accessibleDepartments = [];

    if (userRole === 'main_team') {
        accessibleDepartments = allDepartments;
    } else {
        // Members/Leads only see their own departments
        accessibleDepartments = userDepartments.filter(d =>
            allDepartments.some(ad => ad.toLowerCase() === d.toLowerCase())
        );
    }

    // Normalize logic
    accessibleDepartments = accessibleDepartments.map(d => {
        const match = allDepartments.find(ad => ad.toLowerCase() === d.toLowerCase());
        return match || d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
    });

    // Get selected department from URL or default to first accessible
    const params = await searchParams; // searchParams is a promise
    let selectedDept = params?.dept;

    // Validate selectedDept
    if (!selectedDept || !accessibleDepartments.some(d => d.toLowerCase() === selectedDept.toLowerCase())) {
        if (accessibleDepartments.length > 0) {
            selectedDept = accessibleDepartments[0];
        } else {
            // Edge case: User has no departments? Show empty or handle gracefully
            selectedDept = null;
        }
    }

    // If we have a selected department (which we should unless user has no depts), fetch data
    let leaderboard = [];
    if (selectedDept) {
        const normalizedDept = selectedDept.toLowerCase();

        // 1. Fetch all users who have this department
        // This requires parsing JSON in SQL or fetching all and filtering in JS. 
        // Given Drizzle and typical array storage, fetching all members/leads and filtering in JS is safer/easier for now unless dataset is huge.
        const allUsers = await db.query.users.findMany({
            where: ne(schema.users.role, 'main_team'),
            columns: {
                id: true,
                name: true,
                role: true,
                departments: true,
            }
        });

        const deptUsers = allUsers.filter(u => {
            try {
                const deps = u.departments ? JSON.parse(u.departments) : [];
                const normDeps = Array.isArray(deps) ? deps.map(d => d.toLowerCase()) : [];
                return normDeps.includes(normalizedDept);
            } catch (e) {
                return false;
            }
        });

        // 2. Fetch completed task counts for this department only
        const completedTasks = await db.select({
            userId: schema.videoHistory.userId,
            count: sql`count(*)`.mapWith(Number)
        })
            .from(schema.videoHistory)
            .where(
                and(
                    eq(schema.videoHistory.action, 'completed'),
                    eq(schema.videoHistory.department, normalizedDept)
                )
            )
            .groupBy(schema.videoHistory.userId);

        const scoreMap = new Map();
        completedTasks.forEach(row => {
            scoreMap.set(row.userId, row.count);
        });

        // 3. Merge and Sort
        leaderboard = deptUsers.map(user => ({
            ...user,
            score: scoreMap.get(user.id) || 0
        })).sort((a, b) => b.score - a.score);

        // 4. Assign Ranks
        let currentRank = 1;
        for (let i = 0; i < leaderboard.length; i++) {
            if (i > 0 && leaderboard[i].score < leaderboard[i - 1].score) {
                currentRank = i + 1;
            }
            leaderboard[i].rank = currentRank;
        }
    }

    return (
        <div className={styles.container}>
            <Header title="Leaderboard" />

            <div className={styles.header}>
                <h1 className={styles.title}>🏆 Hall of Fame 🏆</h1>
                <p className={styles.subtitle}>Top performers in {selectedDept}</p>
            </div>

            {/* Department Tabs */}
            {accessibleDepartments.length > 1 && (
                <div className={styles.tabsContainer}>
                    {accessibleDepartments.map(dept => (
                        <Link
                            key={dept}
                            href={`/leaderboard?dept=${dept}`}
                            className={`${styles.tab} ${selectedDept?.toLowerCase() === dept.toLowerCase() ? styles.activeTab : ''}`}
                        >
                            {dept}
                        </Link>
                    ))}
                </div>
            )}

            {!selectedDept ? (
                <div className={styles.emptyState}>
                    <p>No departments assigned.</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Member</th>
                                <th style={{ textAlign: 'right' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length > 0 ? (
                                leaderboard.map((user) => {
                                    let rankClass = styles.rankCell;
                                    if (user.rank === 1) rankClass += ` ${styles.rankTop1}`;
                                    if (user.rank === 2) rankClass += ` ${styles.rankTop2}`;
                                    if (user.rank === 3) rankClass += ` ${styles.rankTop3}`;

                                    return (
                                        <tr key={user.id} style={currentUserId === user.id ? { backgroundColor: 'rgba(var(--primary-rgb), 0.1)' } : {}}>
                                            <td className={rankClass}>
                                                {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                                            </td>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                                                        alt={user.name}
                                                        className={styles.avatar}
                                                    />
                                                    <div className={styles.userInfo}>
                                                        <span className={styles.userName}>{user.name}</span>
                                                        <span className={styles.userRole}>
                                                            {user.role === 'team_lead' ? 'Team Lead' : 'Member'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.scoreCell}>
                                                {user.score} <span className={styles.scoreLabel}>pts</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No members found in this department.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
