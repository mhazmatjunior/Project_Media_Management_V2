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
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
        } else {
            setAuthChecked(true);
        }
    }, [router]);

    useEffect(() => {
        if (authChecked) {
            fetchGraphicsVideos();
        }
    }, [authChecked]);

    const fetchGraphicsVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            const graphics = data.filter(v => v.status === 'running' && v.currentDepartment === 'graphics');
            setGraphicsVideos(graphics);
        } catch (error) {
            console.error('Error fetching graphics videos:', error);
        } finally {
            setLoading(false);
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

    if (!authChecked) {
        return null;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Graphics Department" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Graphics Team</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Design assets and video editing.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <ProjectList
                        title="Active Tasks"
                        projects={loading ? [] : graphicsVideos}
                        showFinishButton={true}
                        onFinishClick={handleFinish}
                    />
                    <TimeTracker />
                </div>
            </div>
        </div>
    );
}
