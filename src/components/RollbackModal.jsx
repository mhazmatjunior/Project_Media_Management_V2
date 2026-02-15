"use client";

import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import styles from './ModalStyles.module.css';

export default function RollbackModal({ isOpen, onClose, onConfirm, title }) {
    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.iconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <AlertTriangle size={32} />
                </div>

                <h3 className={styles.title}>Confirm Rollback</h3>
                <p className={styles.description}>
                    Are you sure you want to rollback <strong>{title}</strong>?<br />
                    This task will be moved back to the <strong>Active List</strong> and <strong>Unassigned</strong>.
                </p>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={`${styles.button} ${styles.dangerButton}`} onClick={onConfirm}>
                        Rollback Task
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
