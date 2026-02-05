"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from "./ProgressChart.module.css";

const COLORS = ['var(--primary-color)', 'rgba(255,255,255,0.1)'];

// Department to completion percentage mapping
// Shows the percentage of work completed BEFORE entering this department
const DEPARTMENT_PROGRESS = {
    'research': 0,   // Just started
    'writer': 25,    // Research completed
    'speaker': 50,   // Research + Writer completed
    'graphics': 75,  // Research + Writer + Speaker completed
};

// Department display names (capitalize)
const DEPARTMENT_NAMES = {
    'research': 'Research',
    'writer': 'Writer',
    'speaker': 'Speaker',
    'graphics': 'Graphics',
};

const ProgressChart = ({ embedded = false, video = null }) => {
    // Calculate completion percentage based on current department
    const completionPercentage = video?.currentDepartment
        ? DEPARTMENT_PROGRESS[video.currentDepartment] || 0
        : 41; // Default fallback

    const departmentName = video?.currentDepartment
        ? DEPARTMENT_NAMES[video.currentDepartment] || video.currentDepartment
        : 'In Progress';

    const data = [
        { name: 'Completed', value: completionPercentage },
        { name: 'Remaining', value: 100 - completionPercentage },
    ];

    return (
        <div className={embedded ? styles.embedded : styles.card}>
            <h3 className={styles.title}>Video Progress</h3>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className={styles.label}>
                    <span className={styles.value}>{completionPercentage}%</span>
                    <span className={styles.text}>In Progress</span>
                </div>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: 'var(--primary-color)' }} />
                    <span>Completed</span>
                </div>
                {video?.currentDepartment && (
                    <div className={styles.legendItem}>
                        <span className={styles.dot} style={{ background: 'white' }} />
                        <span>{departmentName}</span>
                    </div>
                )}
                <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <span>Pending</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressChart;
