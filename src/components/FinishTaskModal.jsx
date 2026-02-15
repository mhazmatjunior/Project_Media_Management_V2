"use client";

import { createPortal } from 'react-dom';
import { X, CheckCircle } from 'lucide-react';
import FileUploader from './FileUploader';
import { useState } from 'react';
import styles from './ModalStyles.module.css';

export default function FinishTaskModal({ isOpen, onClose, onConfirm, videoId, department, title }) {
    const [uploadedKey, setUploadedKey] = useState(null);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!uploadedKey) {
            alert("Please upload the required file before finishing.");
            return;
        }
        onConfirm();
    };

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.iconContainer}>
                    <CheckCircle size={32} />
                </div>

                <h3 className={styles.title}>Complete Task: {title}</h3>
                <p className={styles.description}>
                    Please upload the required assets (Script, Audio, PDF, etc.) to proceed.
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <FileUploader
                        videoId={videoId}
                        department={department}
                        onUploadComplete={(key) => setUploadedKey(key)}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={handleConfirm}
                        disabled={!uploadedKey}
                    >
                        Mark as Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
