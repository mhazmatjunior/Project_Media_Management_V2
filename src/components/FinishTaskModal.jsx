"use client";

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import FileUploader from './FileUploader';
import { useState } from 'react';

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

                <h3 style={{ marginTop: 0, fontSize: '18px', color: '#fff', marginBottom: '8px' }}>
                    Complete Task: {title}
                </h3>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                    Please upload the required assets (Script, Audio, PDF, etc.) to proceed.
                </p>

                <FileUploader
                    videoId={videoId}
                    department={department}
                    onUploadComplete={(key) => setUploadedKey(key)}
                />

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #444',
                            color: '#ccc',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!uploadedKey}
                        style={{
                            backgroundColor: uploadedKey ? '#10b981' : '#444',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: uploadedKey ? 'pointer' : 'not-allowed',
                            fontWeight: '500'
                        }}
                    >
                        Mark as Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
