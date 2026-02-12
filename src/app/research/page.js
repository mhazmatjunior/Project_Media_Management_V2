"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";
import VideoDetailsModal from "@/components/VideoDetailsModal";
import FinishTaskModal from "@/components/FinishTaskModal";
import RollbackModal from "@/components/RollbackModal";
import styles from "@/styles/SharedLayout.module.css";

export default function ResearchPage() {
    const router = useRouter();
    const [researchVideos, setResearchVideos] = useState([]);
    const [completedResearchVideos, setCompletedResearchVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewingVideo, setViewingVideo] = useState(null);
    const [videoToFinish, setVideoToFinish] = useState(null);
    const [videoToRollback, setVideoToRollback] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Check authentication and permissions
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
        } else {
            const session = JSON.parse(localStorage.getItem('user_session'));
            if (session) {
                setUserRole(session.role);
                setCurrentUserId(session.id);
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
                    router.push('/');
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

            const session = JSON.parse(localStorage.getItem('user_session'));
            const isMember = session?.role === 'member';
            const userId = session?.id;

            let research = data.filter(v => v.status === 'running' && v.currentDepartment === 'research');

            if (isMember) {
                research = research.filter(v => v.assignedTo === userId);
            }

            setResearchVideos(research);

            // Fetch completed/review tasks for this department
            const completed = data.filter(v =>
                v.currentDepartment === 'research' &&
                v.status === 'department_completed'
            );
            setCompletedResearchVideos(completed);

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
                    status: 'running', // Reset to running for next department
                    assignedTo: null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to forward video');
            }

            await fetchResearchVideos();
            if (selectedTask?.id === videoId) {
                setSelectedTask(null);
            }
        } catch (error) {
            console.error('Error forwarding video:', error);
            alert('Failed to forward video. Please try again.');
        }
    };

    const handleConfirmFinish = async () => {
        if (!videoToFinish) return;

        try {
            const response = await fetch(`/api/videos/${videoToFinish.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'department_completed' }),
            });
            if (!response.ok) throw new Error('Failed to mark as done');

            await fetchResearchVideos();
            setVideoToFinish(null);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to mark as done');
        }
    };

    const handleRollback = (video) => {
        const videoObj = completedResearchVideos.find(v => v.id === video);
        setVideoToRollback(videoObj || { id: video, name: 'Task' });
    };

    const handleConfirmRollback = async () => {
        if (!videoToRollback) return;

        try {
            const response = await fetch(`/api/videos/${videoToRollback.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'running',
                    assignedTo: null
                }),
            });

            if (!response.ok) throw new Error('Failed to rollback video');

            await fetchResearchVideos();
            setVideoToRollback(null);
        } catch (error) {
            console.error('Error rolling back video:', error);
            alert('Failed to rollback video');
        }
    };

    const handleTaskClick = (project) => {
        setViewingVideo(project);
    };

    const handleTimeClick = (project) => {
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
        <div className={styles.pageContainer}>
            <Header title="Research Dep" />
            <div className={styles.contentContainer}>
                <div className={styles.pageHeader}>
                    <h2>Research Tasks</h2>
                    <p className={styles.pageDescription}>
                        Research documents and data gathering for running videos.
                    </p>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.taskListColumn}>
                        <ProjectList
                            title={userRole === 'member' ? "Assigned Tasks" : "Active Tasks"}
                            projects={researchVideos}
                            loading={loading}
                            showForwardButton={false}
                            showFinishButton={userRole === 'member'}
                            onFinishClick={(id) => {
                                const video = researchVideos.find(v => v.id === id);
                                setVideoToFinish(video);
                            }}
                            finishButtonText="Done"
                            members={members}
                            currentUserId={currentUserId}
                            onAssign={userRole === 'member' ? null : handleAssign}
                            onSelect={handleTaskClick}
                            onTimeClick={handleTimeClick}
                            selectedTaskId={selectedTask?.id}
                        />
                        <ProjectList
                            title="Completed Tasks"
                            projects={loading ? [] : completedResearchVideos}
                            showDepartmentBadge={false}
                            showForwardButton={userRole !== 'member'}
                            onForwardClick={handleForward}
                            showRollbackButton={userRole !== 'member'}
                            onRollbackClick={handleRollback}
                            onSelect={handleTaskClick}
                            onTimeClick={handleTimeClick}
                            selectedTaskId={selectedTask?.id}
                        />
                    </div>
                    <TimeTracker selectedTask={selectedTask} />
                </div>
            </div>
            <VideoDetailsModal
                isOpen={!!viewingVideo}
                onClose={() => setViewingVideo(null)}
                video={viewingVideo}
            />
            <FinishTaskModal
                isOpen={!!videoToFinish}
                onClose={() => setVideoToFinish(null)}
                onConfirm={handleConfirmFinish}
                videoId={videoToFinish?.id}
                department="research"
                title={videoToFinish?.name}
            />
            <RollbackModal
                isOpen={!!videoToRollback}
                onClose={() => setVideoToRollback(null)}
                onConfirm={handleConfirmRollback}
                title={videoToRollback?.name}
            />
        </div>
    );
}
