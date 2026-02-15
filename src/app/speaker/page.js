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
import ConfirmActionModal from "@/components/ConfirmActionModal";
import { ArrowRight, Undo2, ArrowLeft, CheckCircle } from 'lucide-react';
import styles from "@/styles/SharedLayout.module.css";

export default function SpeakerPage() {
    const router = useRouter();
    const [speakerVideos, setSpeakerVideos] = useState([]);
    const [completedSpeakerVideos, setCompletedSpeakerVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewingVideo, setViewingVideo] = useState(null);
    const [videoToFinish, setVideoToFinish] = useState(null);
    const [videoToRollback, setVideoToRollback] = useState(null);
    const [videoToForward, setVideoToForward] = useState(null);
    const [videoToRecall, setVideoToRecall] = useState(null);
    const [videoToReturn, setVideoToReturn] = useState(null);
    const [videoToApprove, setVideoToApprove] = useState(null);
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

                    if (userDeps.includes('speaker')) hasAccess = true;
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
            fetchSpeakerVideos();
            fetchMembers();
        }
    }, [authChecked]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/users/department/speaker');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchSpeakerVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            const session = JSON.parse(localStorage.getItem('user_session'));
            const isMember = session?.role === 'member';
            const userId = session?.id;

            let speaker = data.filter(v => v.status === 'running' && v.currentDepartment === 'speaker');

            if (isMember) {
                speaker = speaker.filter(v => v.assignedTo === userId);
            }

            setSpeakerVideos(speaker);

            // Fetch completed/review tasks for this department
            // AND recently forwarded tasks (last 1 hour) - ONLY for main_team
            const now = new Date();
            const isMainTeam = userRole === 'main_team';
            const completed = data.filter(v =>
                (v.currentDepartment === 'speaker' && (v.status === 'department_completed' || v.status === 'waiting_approval')) ||
                (isMainTeam && v.previousDepartment === 'speaker' && v.forwardedAt && (now - new Date(v.forwardedAt)) < 3600000)
            );
            setCompletedSpeakerVideos(completed);

        } catch (error) {
            console.error('Error fetching speaker videos:', error);
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

            await fetchSpeakerVideos();
        } catch (error) {
            console.error('Error assigning video:', error);
            alert('Failed to assign video. Please try again.');
        }
    };

    const handleConfirmForward = async () => {
        if (!videoToForward) return;
        try {
            const response = await fetch(`/api/videos/${videoToForward.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentDepartment: 'video',
                    status: 'running',
                    assignedTo: null,
                }),
            });

            if (!response.ok) throw new Error('Failed to forward video');

            await fetchSpeakerVideos();
            if (selectedTask?.id === videoToForward.id) setSelectedTask(null);
            setVideoToForward(null);
        } catch (error) {
            console.error('Error forwarding video:', error);
            alert('Failed to forward video');
        }
    };

    const handleConfirmApprove = async () => {
        if (!videoToApprove) return;

        try {
            const response = await fetch(`/api/videos/${videoToApprove.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'waiting_approval' }),
            });
            if (!response.ok) throw new Error('Failed to approve task');

            await fetchSpeakerVideos();
            setVideoToApprove(null);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to approve task');
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

            await fetchSpeakerVideos();
            setVideoToFinish(null);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to mark as done');
        }
    };

    const handleRollback = (video) => {
        const videoObj = completedSpeakerVideos.find(v => v.id === video);
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

            await fetchSpeakerVideos();
            setVideoToRollback(null);
        } catch (error) {
            console.error('Error rolling back video:', error);
            alert('Failed to rollback video');
        }
    };

    const handleConfirmRecall = async () => {
        if (!videoToRecall) return;
        try {
            const response = await fetch(`/api/videos/${videoToRecall.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'request_takeback' }),
            });
            if (!response.ok) throw new Error('Failed to request takeback');
            await fetchSpeakerVideos();
            setVideoToRecall(null);
        } catch (error) {
            console.error('Error requesting takeback:', error);
            alert('Failed to request takeback');
        }
    };

    const handleConfirmReturnForReal = async () => {
        if (!videoToReturn) return;
        try {
            const response = await fetch(`/api/videos/${videoToReturn.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'confirm_takeback' }),
            });
            if (!response.ok) throw new Error('Failed to return task');
            await fetchSpeakerVideos();
            setVideoToReturn(null);
        } catch (error) {
            console.error('Error returning task:', error);
            alert('Failed to return task');
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
            <Header title="Speaker Dep" />
            <div className={styles.contentContainer}>
                <div className={styles.pageHeader}>
                    <h2>Speaker Analytics</h2>
                    <p className={styles.pageDescription}>
                        Voice recording and narration for videos.
                    </p>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.taskListColumn}>
                        <ProjectList
                            title={userRole === 'member' ? "Assigned Tasks" : "Active Tasks"}
                            projects={speakerVideos}
                            loading={loading}
                            showForwardButton={false}
                            showFinishButton={userRole === 'member'}
                            onFinishClick={(id) => {
                                const video = speakerVideos.find(v => v.id === id);
                                setVideoToFinish(video);
                            }}
                            finishButtonText="Done"
                            members={members}
                            currentUserId={currentUserId}
                            userRole={userRole}
                            onAssign={userRole === 'member' ? null : handleAssign}
                            onSelect={handleTaskClick}
                            onTimeClick={handleTimeClick}
                            selectedTaskId={selectedTask?.id}
                            onSendBackClick={(id) => {
                                const video = speakerVideos.find(v => v.id === id);
                                setVideoToReturn(video);
                            }}
                            departmentName="speaker"
                        />
                        <ProjectList
                            title="Completed Tasks"
                            projects={loading ? [] : completedSpeakerVideos}
                            showDepartmentBadge={false}
                            showForwardButton={userRole === 'main_team'}
                            onForwardClick={(id) => {
                                const video = completedSpeakerVideos.find(v => v.id === id);
                                setVideoToForward(video);
                            }}
                            showFinishButton={userRole === 'team_lead'}
                            onFinishClick={(id) => {
                                const video = completedSpeakerVideos.find(v => v.id === id);
                                if (video.status === 'department_completed') {
                                    setVideoToApprove(video);
                                }
                            }}
                            finishButtonText="Mark as Done"
                            showRollbackButton={userRole !== 'member'}
                            onRollbackClick={handleRollback}
                            onSelect={handleTaskClick}
                            onTimeClick={handleTimeClick}
                            selectedTaskId={selectedTask?.id}
                            userRole={userRole}
                            onTakebackClick={(id) => {
                                const video = completedSpeakerVideos.find(v => v.id === id);
                                setVideoToRecall(video);
                            }}
                            departmentName="speaker"
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
                department="speaker"
                title={videoToFinish?.name}
            />
            <RollbackModal
                isOpen={!!videoToRollback}
                onClose={() => setVideoToRollback(null)}
                onConfirm={handleConfirmRollback}
                title={videoToRollback?.name}
            />

            {/* Confirmation Modals */}
            <ConfirmActionModal
                isOpen={!!videoToForward}
                onClose={() => setVideoToForward(null)}
                onConfirm={handleConfirmForward}
                title="Forward Task"
                description={`Are you sure you want to forward "${videoToForward?.name}" to the Video department?`}
                confirmText="Forward Now"
                icon={ArrowRight}
            />

            <ConfirmActionModal
                isOpen={!!videoToRecall}
                onClose={() => setVideoToRecall(null)}
                onConfirm={handleConfirmRecall}
                title="Recall Task"
                description={`Request to take back "${videoToRecall?.name}" from the next department?`}
                confirmText="Recall Task"
                variant="warning"
                icon={Undo2}
            />

            <ConfirmActionModal
                isOpen={!!videoToReturn}
                onClose={() => setVideoToReturn(null)}
                onConfirm={handleConfirmReturnForReal}
                title="Return Task"
                description={`Are you sure you want to return "${videoToReturn?.name}" to the previous department?`}
                confirmText="Return Task"
                variant="danger"
                icon={ArrowLeft}
            />

            <ConfirmActionModal
                isOpen={!!videoToApprove}
                onClose={() => setVideoToApprove(null)}
                onConfirm={handleConfirmApprove}
                title="Approve Task"
                description={`Mark "${videoToApprove?.name}" as done for the Main Team's review?`}
                confirmText="Approve & Mark Done"
                icon={CheckCircle}
            />
        </div>
    );
}
