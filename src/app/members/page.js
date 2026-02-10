import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { db, schema } from "@/db";
import { ne, eq } from "drizzle-orm";
import styles from "@/styles/SharedLayout.module.css";
import MembersTable from "./MembersTable";

export default async function MembersPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    let userRole = null;
    try {
        const session = JSON.parse(sessionCookie.value);
        userRole = session.role;
    } catch (e) {
        redirect('/');
    }

    if (userRole !== 'main_team' && userRole !== 'team_lead') {
        redirect('/');
    }

    // Get current user's department for team leads
    let leadDepartments = [];
    if (userRole === 'team_lead') {
        try {
            const session = JSON.parse(sessionCookie.value);
            const fullUser = await db.query.users.findFirst({
                where: eq(schema.users.id, session.id)
            });

            if (fullUser && fullUser.departments) {
                try {
                    leadDepartments = JSON.parse(fullUser.departments).map(d => d.toLowerCase());
                } catch (e) {
                    leadDepartments = fullUser.departments.split(',').map(d => d.trim().toLowerCase());
                }
            }
        } catch (error) {
            console.error("Error fetching lead departments:", error);
        }
    }

    // Fetch users excluding 'main_team'
    let users = await db.query.users.findMany({
        where: ne(schema.users.role, 'main_team'),
    });

    // If team_lead, filter users by department sharing
    if (userRole === 'team_lead') {
        const session = JSON.parse(sessionCookie.value);
        users = users.filter(u => {
            if (u.id === session.id) return false; // Don't show the lead themselves
            if (!u.departments) return false;
            let memberDeps = [];
            try {
                memberDeps = JSON.parse(u.departments).map(d => d.toLowerCase());
            } catch (e) {
                memberDeps = u.departments.split(',').map(d => d.trim().toLowerCase());
            }

            return leadDepartments.some(ld => memberDeps.includes(ld));
        });
    }

    // Sort: Team Leads first, then others
    const sortedUsers = users.sort((a, b) => {
        if (a.role === 'team_lead' && b.role !== 'team_lead') return -1;
        if (a.role !== 'team_lead' && b.role === 'team_lead') return 1;
        return 0;
    });

    // Fetch active assignments (status == 'in_progress')
    // We fetch all and then MembersTable handles mapping, but we can filter here for efficiency if needed
    const activeTasks = await db.query.videos.findMany({
        where: eq(schema.videos.status, 'in_progress'),
        columns: { assignedTo: true }
    });

    // Create an array of user IDs who are currently assigned to active tasks
    const workingUserIds = activeTasks
        .filter(task => task.assignedTo !== null)
        .map(task => task.assignedTo);

    return (
        <div className={styles.pageContainer}>
            <Header title="Members" />

            <div className={styles.contentContainer}>
                <MembersTable
                    initialUsers={sortedUsers}
                    workingUserIds={workingUserIds}
                />
            </div>
        </div>
    );
}
