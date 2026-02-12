"use client";

import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

export default function RollbackModal({ isOpen, onClose, onConfirm, title }) {
    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: '#1e1e1e', // Dark theme background
                padding: '24px',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90%',
                border: '1px solid #333',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', color: '#888', cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ef4444'
                    }}>
                        <AlertTriangle size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                        Confirm Rollback
                    </h3>
                </div>

                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px', lineHeight: '1.5' }}>
                    Are you sure you want to rollback <strong>{title}</strong>?
                </p>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
                    This task will be moved back to the <strong>Active List</strong> and <strong>Assigned to None</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #444',
                            color: '#ccc',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Rollback Task
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
