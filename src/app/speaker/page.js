"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";

export default function SpeakerPage() {
    const router = useRouter();
    const [speakerVideos, setSpeakerVideos] = useState([]);
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
            fetchSpeakerVideos();
        }
    }, [authChecked]);

    const fetchSpeakerVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            const speaker = data.filter(v => v.status === 'running' && v.currentDepartment === 'speaker');
            setSpeakerVideos(speaker);
        } catch (error) {
            console.error('Error fetching speaker videos:', error);
        } finally {
            setLoading(false);
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
                    currentDepartment: 'graphics',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to forward video');
            }

            await fetchSpeakerVideos();
        } catch (error) {
            console.error('Error forwarding video:', error);
            alert('Failed to forward video. Please try again.');
        }
    };

    if (!authChecked) {
        return null;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Speaker Department" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Speaker Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Voice recording and narration for videos.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <ProjectList
                        title="Active Tasks"
                        projects={loading ? [] : speakerVideos}
                        showForwardButton={true}
                        onForwardClick={handleForward}
                    />
                    <TimeTracker />
                </div>
            </div>
        </div>
    );
}
