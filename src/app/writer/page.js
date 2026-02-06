"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";

export default function WriterPage() {
    const router = useRouter();
    const [writerVideos, setWriterVideos] = useState([]);
    const [completedWriterVideos, setCompletedWriterVideos] = useState([]);
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

                    if (userDeps.includes('writer')) hasAccess = true;
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
            fetchWriterVideos();
            fetchMembers();
        }
    }, [authChecked]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/users/department/writer');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchWriterVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            const session = JSON.parse(localStorage.getItem('user_session'));
            const isMember = session?.role === 'member';
            const userId = session?.id;

            let writer = data.filter(v => v.status === 'running' && v.currentDepartment === 'writer');

            if (isMember) {
                writer = writer.filter(v => v.assignedTo === userId);
            }

            if (isMember) {
                writer = writer.filter(v => v.assignedTo === userId);
            }

            setWriterVideos(writer);

            // Fetch completed/review tasks for this department
            const completed = data.filter(v =>
                v.currentDepartment === 'writer' &&
                v.status === 'department_completed'
            );
            setCompletedWriterVideos(completed);

        } catch (error) {
            console.error('Error fetching writer videos:', error);
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

            await fetchWriterVideos();
        } catch (error) {
            console.error('Error assigning video:', error);
            alert('Failed to assign video. Please try again.');
        }
    };

    const handleForward = async (videoId) => {
        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentDepartment: 'speaker',
                    status: 'running', // Reset to running for next department
                    assignedTo: null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to forward video');
            }

            await fetchWriterVideos();
            if (selectedTask?.id === videoId) {
                setSelectedTask(null);
            }
        } catch (error) {
            console.error('Error forwarding video:', error);
            alert('Failed to forward video. Please try again.');
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
            <Header title="Writer Dep" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Content Creation</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Writing scripts and content for videos.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <ProjectList
                            title={userRole === 'member' ? "Assigned Tasks" : "Active Tasks"}
                            projects={writerVideos}
                            loading={loading}
                            showForwardButton={false}
                            showFinishButton={userRole === 'member'}
                            onFinishClick={async (id) => {
                                // Mark as Done (department_completed)
                                try {
                                    const response = await fetch(`/api/videos/${id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'department_completed' }),
                                    });
                                    if (!response.ok) throw new Error('Failed to mark as done');
                                    await fetchWriterVideos();
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
                            projects={loading ? [] : completedWriterVideos} // We need to fetch these
                            showDepartmentBadge={false}
                            showForwardButton={userRole !== 'member'}
                            onForwardClick={handleForward}
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
