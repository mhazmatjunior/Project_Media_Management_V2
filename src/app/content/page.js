"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus } from "lucide-react";
import CustomSelect from "./CustomSelect";

const DEPARTMENTS = [
    "Research",
    "Writer",
    "Speaker",
    "Video",
    "Graphics"
];

const CATEGORIES = ["YL", "CTA"];

import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ContentPage() {
    const router = useRouter();
    // State for the content data
    const [data, setData] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Selection state
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCat, setSelectedCat] = useState(null);

    // Form state
    const [formDept, setFormDept] = useState(DEPARTMENTS[0]);
    const [formCat, setFormCat] = useState(CATEGORIES[0]);
    const [formTopic, setFormTopic] = useState("");

    // Load data from localStorage on mount and check auth
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
            return;
        }

        const session = JSON.parse(localStorage.getItem('user_session'));
        if (session) {
            setUserRole(session.role);
        }

        const savedData = localStorage.getItem("content_calendar_data");
        if (savedData) {
            setData(JSON.parse(savedData));
        } else {
            // Initialize empty structure
            const initialData = {};
            DEPARTMENTS.forEach(dept => {
                initialData[dept] = {};
                CATEGORIES.forEach(cat => {
                    initialData[dept][cat] = [];
                });
            });
            setData(initialData);
        }
        setIsLoaded(true);
    }, [router]);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("content_calendar_data", JSON.stringify(data));
        }
    }, [data, isLoaded]);

    const handleAddTopic = (e) => {
        e.preventDefault();
        if (!formTopic.trim()) return;

        const newData = { ...data };

        // Ensure structure exists (just in case)
        if (!newData[formDept]) newData[formDept] = {};
        if (!newData[formDept][formCat]) newData[formDept][formCat] = [];

        newData[formDept][formCat].push(formTopic);

        setData(newData);
        setFormTopic("");

        // Auto-select the added path to show the new item
        setSelectedDept(formDept);
        setSelectedCat(formCat);
    };

    const currentCategories = selectedDept ? CATEGORIES : [];
    const currentTopics = (selectedDept && selectedCat && data[selectedDept] && data[selectedDept][selectedCat])
        ? data[selectedDept][selectedCat]
        : [];

    if (!isLoaded) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Content Calendar</h1>
            </header>

            {/* Miller Columns Display */}
            <div className={styles.columnsContainer}>
                {/* Column 1: Departments */}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>Department</div>
                    {DEPARTMENTS.map(dept => (
                        <div
                            key={dept}
                            className={`${styles.item} ${selectedDept === dept ? styles.activeItem : ''}`}
                            onClick={() => {
                                setSelectedDept(dept);
                                setSelectedCat(null); // Reset category when dept changes
                            }}
                        >
                            {dept}
                        </div>
                    ))}
                </div>

                {/* Column 2: Categories */}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>Category</div>
                    {selectedDept ? (
                        CATEGORIES.map(cat => (
                            <div
                                key={cat}
                                className={`${styles.item} ${selectedCat === cat ? styles.activeItem : ''}`}
                                onClick={() => setSelectedCat(cat)}
                            >
                                {cat}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>Select a department</div>
                    )}
                </div>

                {/* Column 3: Topics */}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>Topics</div>
                    {selectedCat ? (
                        currentTopics.length > 0 ? (
                            currentTopics.map((topic, idx) => (
                                <div key={idx} className={`${styles.item} ${styles.topicItem}`}>
                                    {topic}
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>No topics yet</div>
                        )
                    ) : (
                        <div className={styles.emptyState}>Select a category</div>
                    )}
                </div>
            </div>

            {/* Input Form - Only visible to main_team */}
            {userRole === 'main_team' && (
                <div className={styles.formSection}>
                    <h2 className={styles.formTitle}>Add New Content</h2>
                    <form onSubmit={handleAddTopic} className={styles.formGrid}>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Department</label>
                            <CustomSelect
                                options={DEPARTMENTS}
                                value={formDept}
                                onChange={setFormDept}
                                placeholder="Select Department"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Category</label>
                            <CustomSelect
                                options={CATEGORIES}
                                value={formCat}
                                onChange={setFormCat}
                                placeholder="Select Category"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Topic</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Enter topic title..."
                                value={formTopic}
                                onChange={(e) => setFormTopic(e.target.value)}
                            />
                        </div>

                        <button type="submit" className={styles.button} disabled={!formTopic.trim()}>
                            Add to Calendar
                        </button>

                    </form>
                </div>
            )}
        </div>
    );
}
