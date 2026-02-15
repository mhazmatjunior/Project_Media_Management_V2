"use client";

import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import styles from './ModalStyles.module.css';

export default function ConfirmActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary", // primary, danger, warning
    icon: Icon = AlertCircle
}) {
    if (!isOpen) return null;

    const getButtonClass = () => {
        if (variant === "danger") return styles.dangerButton;
        if (variant === "warning") return styles.warningButton;
        return styles.confirmButton;
    };

    const getIconColor = () => {
        if (variant === "danger") return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
        if (variant === "warning") return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
        return {}; // Use default from CSS
    };

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.iconContainer} style={getIconColor()}>
                    <Icon size={32} />
                </div>

                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`${styles.button} ${getButtonClass()}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
