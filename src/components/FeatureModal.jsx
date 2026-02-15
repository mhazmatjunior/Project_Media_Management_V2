"use client";

import React, { useState, useEffect } from "react";
import styles from "./FeatureModal.module.css";
import { Sparkles, RotateCcw, Trophy, Zap, AlertCircle, ArrowRight, Timer, ShieldCheck, BellRing, Layout } from "lucide-react";
import { getSession } from "@/lib/auth";

export default function FeatureModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [storageKey, setStorageKey] = useState(null);

    useEffect(() => {
        const session = getSession();
        if (!session) return;

        // Create a unique key for this user/version combo
        const userKey = `seen_onboarding_mega_${session.id}`;
        setStorageKey(userKey);

        // Check if this specific user has seen this update
        const hasSeen = localStorage.getItem(userKey);
        if (!hasSeen) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const handleClose = () => {
        if (storageKey) {
            localStorage.setItem(storageKey, "true");
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {step === 1 ? (
                    <>
                        <div className={styles.iconContainer} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            <Trophy size={40} />
                        </div>

                        <h2 className={styles.title}>Mega Features Unlocked!</h2>

                        <p className={styles.description}>
                            We've introduced several major systems to maximize efficiency and project oversight across all departments.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Timer size={18} /></div>
                                <span><b>Deadlines System:</b> Real-time alerts & global tracking for all your tasks.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><RotateCcw size={18} /></div>
                                <span><b>Request & Takeback:</b> Mis-forwarded a task? Recover it instantly within 1 hour.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><BellRing size={18} /></div>
                                <span><b>Specific Reminders:</b> Target team members directly for focused collaboration.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><ShieldCheck size={18} /></div>
                                <span><b>Admin Approval Flow:</b> Structured review layers to ensure production quality.</span>
                            </div>
                        </div>

                        <button className={styles.button} onClick={nextStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Tell me more <ArrowRight size={18} />
                        </button>
                    </>
                ) : step === 2 ? (
                    <>
                        <div className={styles.iconContainer}>
                            <Sparkles size={40} />
                        </div>

                        <h2 className={styles.title}>Premium UI Upgrade</h2>

                        <p className={styles.description}>
                            Today's update introduces a refined visual language and enhanced safety layers for a smoother management experience.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><Layout size={18} /></div>
                                <span><b>Glassmorphism Theme:</b> High-fidelity, modern designs for all task modals.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><ShieldCheck size={18} /></div>
                                <span><b>Confirmation Safety:</b> Smart protection layers for all critical workflow actions.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><Zap size={18} /></div>
                                <span><b>Improved Feedback:</b> Standardized status badges and seamless transitions.</span>
                            </div>
                        </div>

                        <button className={styles.button} onClick={nextStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Next <ArrowRight size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.iconContainer} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
                            <AlertCircle size={40} />
                        </div>

                        <h2 className={styles.title}>System Migration Notice</h2>

                        <p className={styles.description} style={{ textAlign: 'justify' }}>
                            <b>In Sha Allah:</b> We are scheduled to migrate fully to this new management system tomorrow.
                            <br /><br />
                            We kindly request all members to explore these <b>Mega Features</b> today and ensure you are comfortable with the new workflow.
                            <br /><br />
                            Thank you for your cooperation!
                        </p>

                        <button className={styles.button} onClick={handleClose}>
                            I'm ready to explore!
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
