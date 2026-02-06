"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";

export default function ResearchPage() {
    const router = useRouter();
    const [researchVideos, setResearchVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // Check authentication
    // Check authentication and permissions
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
        } else {
            const session = JSON.parse(localStorage.getItem('user_session'));
            if (session) {
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

                    if (userDeps.includes('research')) hasAccess = true;
                }

                if (hasAccess) {
                    setAuthChecked(true);
                } else {
                    // Redirect to their own department
                    router.push('/'); // Or handle smarter redirect
                }
            }
        }
    }, [router]);

    useEffect(() => {
        if (authChecked) {
            fetchResearchVideos();
            fetchMembers();
        }
    }, [authChecked]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/users/department/research');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchResearchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            // Filter videos that are running and in research department
            const research = data.filter(v => v.status === 'running' && v.currentDepartment === 'research');
            setResearchVideos(research);
        } catch (error) {
            console.error('Error fetching research videos:', error);
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

            // Refresh the list
            await fetchResearchVideos();
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
                    currentDepartment: 'writer',
                    assignedTo: null, // Reset assignment when forwarding
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to forward video');
            }

            // Refresh the list
            await fetchResearchVideos();
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

    // Don't render until auth is verified
    if (!authChecked) {
        return null;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Research Dep" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Research Tasks</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Research documents and data gathering for running videos.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <ProjectList
                            title="Active Tasks"
                            projects={researchVideos}
                            loading={loading}
                            showForwardButton={true}
                            onForwardClick={handleForward}
                            members={members}
                            onAssign={handleAssign}
                            onSelect={handleTaskSelect}
                            selectedTaskId={selectedTask?.id}
                        />
                        <ProjectList
                            title="Completed Tasks"
                            projects={[]}
                            showDepartmentBadge={true}
                        />
                    </div>
                    <TimeTracker selectedTask={selectedTask} />
                </div>
            </div>
        </div>
    );
}
