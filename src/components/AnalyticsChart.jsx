"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from "./AnalyticsChart.module.css";

const data = [
    { name: 'S', value: 30 },
    { name: 'M', value: 45 },
    { name: 'T', value: 60 }, // Highlighted
    { name: 'W', value: 70 },
    { name: 'T', value: 40 },
    { name: 'F', value: 50 },
    { name: 'S', value: 65 },
];

const AnalyticsChart = () => {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Video Analytics</h3>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#888', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={35}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 2 ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}
                                    className={styles.bar}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsChart;
