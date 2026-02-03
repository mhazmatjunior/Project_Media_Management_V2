"use client";

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft } from "lucide-react";
import ProgressChart from "./ProgressChart";
import TeamList from "./TeamList";
import styles from "./OngoingVideoAnalytics.module.css";

const OngoingVideoAnalytics = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Get videos from Redux store
    const videos = useSelector((state) => state.videos.videos);

    // Filter for running videos only
    const runningVideos = videos.filter(v => v.status === 'running');

    // Filter for running/ended videos effectively, or just use all for analytics
    // The previous chart showed specific values. We'll map 'value' from our store.
    const chartData = runningVideos.map(v => ({
        name: v.name,
        value: v.value || 0, // Fallback if no value
        id: v.id,
        // Shorten name for X-axis if needed
        shortName: v.name.length > 10 ? v.name.substring(0, 8) + '...' : v.name
    }));

    const handleBarClick = (data, index) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            setSelectedVideo(data.activePayload[0].payload);
        } else if (data && data.payload) { // Direct click on Cell
            setSelectedVideo(data.payload);
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
                            <ProgressChart embedded={true} />
                        </div>
                        <div className={styles.separator} />
                        <div className={styles.half}>
                            <TeamList embedded={true} />
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
