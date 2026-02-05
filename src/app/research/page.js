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
            fetchResearchVideos();
        }
    }, [authChecked]);

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

    const handleForward = async (videoId) => {
        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentDepartment: 'writer',
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

    // Don't render until auth is verified
    if (!authChecked) {
        return null;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Research Department" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Research Tasks</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Research documents and data gathering for running videos.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <ProjectList
                        title="Active Tasks"
                        projects={loading ? [] : researchVideos}
                        showForwardButton={true}
                        onForwardClick={handleForward}
                    />
                    <TimeTracker />
                </div>
            </div>
        </div>
    );
}
