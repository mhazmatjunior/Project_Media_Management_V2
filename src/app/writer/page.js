"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";

export default function WriterPage() {
    const [writerVideos, setWriterVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWriterVideos();
    }, []);

    const fetchWriterVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos');
            const data = await response.json();

            const writer = data.filter(v => v.status === 'running' && v.currentDepartment === 'writer');
            setWriterVideos(writer);
        } catch (error) {
            console.error('Error fetching writer videos:', error);
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
                    currentDepartment: 'speaker',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to forward video');
            }

            await fetchWriterVideos();
        } catch (error) {
            console.error('Error forwarding video:', error);
            alert('Failed to forward video. Please try again.');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Writer Department" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Content Creation</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Writing scripts and content for videos.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <ProjectList
                        title="Active Tasks"
                        projects={loading ? [] : writerVideos}
                        showForwardButton={true}
                        onForwardClick={handleForward}
                    />
                    <TimeTracker />
                </div>
            </div>
        </div>
    );
}
