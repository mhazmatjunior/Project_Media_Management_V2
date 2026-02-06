"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";

export default function GraphicsPage() {
    const router = useRouter();
    const [graphicsVideos, setGraphicsVideos] = useState([]);
    const [completedGraphicsVideos, setCompletedGraphicsVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // Check authentication
    // Check authentication and permissions
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
        } else {
            const session = JSON.parse(localStorage.getItem('user_session'));
            if (session) {
                setUserRole(session.role);
                let hasAccess = false;
                if (session.role === 'main_team') hasAccess = true;
                else {
                    let userDeps = [];
                    if (session.departments) {
                        try {
                            const parsed = JSON.parse(session.departments);
                            userDeps = Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            userDeps = session.departments.split(',').map(d => d.trim());
                        }
                    }
                    // Normalize
                    userDeps = userDeps.map(d => d.toLowerCase());
                    if (userDeps.includes('graphics')) hasAccess = true;
                }

                if (hasAccess) {
                    setAuthChecked(true);
                } else {
                    router.push('/');
                }
            }
        }
    }, [router]);

    useEffect(() => {
        if (authChecked) {
            fetchGraphicsVideos();
            fetchMembers();
        }
    }, [authChecked]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/users/department/graphics');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchGraphicsVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            const session = JSON.parse(localStorage.getItem('user_session'));
            const isMember = session?.role === 'member';
            const userId = session?.id;

            let graphics = data.filter(v => v.status === 'running' && v.currentDepartment === 'graphics');

            if (isMember) {
                graphics = graphics.filter(v => v.assignedTo === userId);
            }

            if (isMember) {
                graphics = graphics.filter(v => v.assignedTo === userId);
            }

            setGraphicsVideos(graphics);

            // Fetch completed/review tasks for this department
            const completed = data.filter(v =>
                v.currentDepartment === 'graphics' &&
                v.status === 'department_completed'
            );
            setCompletedGraphicsVideos(completed);

        } catch (error) {
            console.error('Error fetching graphics videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (videoId, userId) => {
        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignedTo: userId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign video');
            }

            await fetchGraphicsVideos();
        } catch (error) {
            console.error('Error assigning video:', error);
            alert('Failed to assign video. Please try again.');
        }
    };

    const handleFinish = async (videoId) => {
        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'ended',
                    currentDepartment: null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to finish video');
            }

            await fetchGraphicsVideos();
        } catch (error) {
            console.error('Error finishing video:', error);
            alert('Failed to finish video. Please try again.');
        }
    };

    const handleTaskSelect = (project) => {
        if (selectedTask?.id === project.id) {
            setSelectedTask(null);
        } else {
            setSelectedTask(project);
        }
    };

    if (!authChecked) {
        return null;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Graphics Dep" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Graphics Team</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Design assets and video editing.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <ProjectList
                            title={userRole === 'member' ? "Assigned Tasks" : "Active Tasks"}
                            projects={graphicsVideos}
                            loading={loading}
                            showFinishButton={userRole === 'member'} // Only member marks as Done here
                            onFinishClick={async (id) => {
                                // Member: Mark as Done (department_completed)
                                try {
                                    const response = await fetch(`/api/videos/${id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'department_completed' }),
                                    });
                                    if (!response.ok) throw new Error('Failed to mark as done');
                                    await fetchGraphicsVideos();
                                } catch (error) {
                                    console.error('Error:', error);
                                    alert('Failed to mark as done');
                                }
                            }}
                            finishButtonText="Done"
                            members={members}
                            onAssign={userRole === 'member' ? null : handleAssign}
                            onSelect={handleTaskSelect}
                            selectedTaskId={selectedTask?.id}
                        />
                        <ProjectList
                            title="Completed Tasks"
                            projects={loading ? [] : completedGraphicsVideos}
                            showDepartmentBadge={false}
                            showFinishButton={userRole !== 'member'} // Lead can Finish (End) the video
                            onFinishClick={handleFinish}
                            onSelect={handleTaskSelect}
                            selectedTaskId={selectedTask?.id}
                        />
                    </div>
                    <TimeTracker selectedTask={selectedTask} />
                </div>
            </div>
        </div>
    );
}
