"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from "./ProgressChart.module.css";

const data = [
    { name: 'Completed', value: 41 },
    { name: 'Remaining', value: 59 },
];

const COLORS = ['var(--primary-color)', 'rgba(255,255,255,0.1)'];

const ProgressChart = ({ embedded = false }) => {
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
                    <span className={styles.value}>41%</span>
                    <span className={styles.text}>Video Ended</span>
                </div>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: 'var(--primary-color)' }} />
                    <span>Completed</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#e0e0e0' }} />
                    <span>In Progress</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#ccc', opacity: 0.5 }} />
                    <span>Pending</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressChart;
