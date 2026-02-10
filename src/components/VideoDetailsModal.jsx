"use client";
import React from 'react';
import { X, Calendar, User, Activity } from 'lucide-react';

const VideoDetailsModal = ({ isOpen, onClose, video }) => {
    if (!isOpen || !video) return null;

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }} onClick={handleBackdropClick}>
            <div style={{
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '30px',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <X size={24} />
                </button>

                <h2 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    paddingRight: '40px',
                    lineHeight: '1.3'
                }}>
                    {video.name}
                </h2>

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap',
                    marginBottom: '25px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{video.date}</span>
                    </div>
                    {video.status && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: video.color || 'var(--primary-color)'
                        }}>
                            <Activity size={14} />
                            <span style={{ textTransform: 'capitalize' }}>
                                {video.status.replace('_', ' ')}
                            </span>
                        </div>
                    )}
                    {video.assigneeName && video.status !== 'ended' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} />
                            <span>{video.assigneeName}</span>
                        </div>
                    )}
                </div>

                <div style={{
                    backgroundColor: 'var(--background-color)',
                    padding: '20px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    whiteSpace: 'pre-wrap'
                }}>
                    {video.description || "No description provided."}
                </div>

                <div style={{
                    marginTop: '25px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: 'var(--primary-color)',
                            border: 'none',
                            borderRadius: 'var(--border-radius-sm)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailsModal;
