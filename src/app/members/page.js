import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { db, schema } from "@/db";
import { ne, eq } from "drizzle-orm";
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

    if (userRole !== 'main_team') {
        redirect('/');
    }

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

    // Fetch active assignments (status == 'in_progress')
    const activeTasks = await db.query.videos.findMany({
        where: eq(schema.videos.status, 'in_progress'),
        columns: { assignedTo: true }
    });

    // Create an array of user IDs who are currently assigned to active tasks
    const workingUserIds = activeTasks
        .filter(task => task.assignedTo !== null)
        .map(task => task.assignedTo);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Members" />

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <MembersTable
                    initialUsers={sortedUsers}
                    workingUserIds={workingUserIds}
                />
            </div>
        </div>
    );
}
