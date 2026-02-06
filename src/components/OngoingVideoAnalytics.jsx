"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft } from "lucide-react";
import ProgressChart from "./ProgressChart";
import TeamList from "./TeamList";
import styles from "./OngoingVideoAnalytics.module.css";

const OngoingVideoAnalytics = ({ videos = [] }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);

    // Use passed videos prop (already filtered for running videos)
    const runningVideos = videos;

    // Fetch history when selectedVideo changes
    useEffect(() => {
        if (selectedVideo) {
            fetch(`/api/videos/${selectedVideo.id}/history`)
                .then(res => res.json())
                .then(data => {
                    const members = [...data];
                    // Add current assignee if exists
                    if (selectedVideo.assignedTo && selectedVideo.assigneeName) {
                        members.push({
                            name: selectedVideo.assigneeName,
                            role: `Working on ${selectedVideo.currentDepartment ? selectedVideo.currentDepartment.charAt(0).toUpperCase() + selectedVideo.currentDepartment.slice(1) : 'Task'}`,
                            status: 'In Progress',
                            img: `https://i.pravatar.cc/150?u=${selectedVideo.assigneeName}`
                        });
                    }
                    setTeamMembers(members);
                })
                .catch(err => console.error('Error fetching history:', err));
        }
    }, [selectedVideo]);

    const chartData = runningVideos.map(v => ({
        name: v.name,
        value: v.value || 50, // Default progress for running videos
        id: v.id,
        currentDepartment: v.currentDepartment, // Include department info
        // Shorten name for X-axis if needed
        shortName: v.name.length > 10 ? v.name.substring(0, 8) + '...' : v.name,
        // Keep full video object for reference
        video: v
    }));

    const handleBarClick = (data, index) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            // Use the full video object from the payload
            setSelectedVideo(data.activePayload[0].payload.video || data.activePayload[0].payload);
        } else if (data && data.payload) { // Direct click on Cell
            setSelectedVideo(data.payload.video || data.payload);
        }
    };

    return (
        <div className={styles.container}>
            {selectedVideo ? (
                <div className={styles.detailsView}>
                    <div className={styles.header}>
                        <button onClick={() => setSelectedVideo(null)} className={styles.backButton}>
                            <ArrowLeft size={20} />
                        </button>
                        <h3 className={styles.title}>Analytics: {selectedVideo.name}</h3>
                    </div>

                    <div className={styles.splitContent}>
                        <div className={styles.half}>
                            <ProgressChart embedded={true} video={selectedVideo} />
                        </div>
                        <div className={styles.separator} />
                        <div className={styles.half}>
                            <TeamList embedded={true} members={teamMembers} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.chartView}>
                    <h3 className={styles.title}>Ongoing Video Analytics</h3>
                    <p className={styles.subtitle}>Click a bar to view video details</p>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} onClick={handleBarClick}>
                                <XAxis
                                    dataKey="name" // Or use "shortName" if labels get too long
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#222', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={35} onClick={handleBarClick}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index % 2 === 0 ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}
                                            className={styles.bar}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OngoingVideoAnalytics;
