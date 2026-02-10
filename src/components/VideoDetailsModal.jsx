import AssetList from './AssetList';
import FileUploader from './FileUploader';
import { getSession } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { X, Calendar, User, Activity } from 'lucide-react';

const VideoDetailsModal = ({ isOpen, onClose, video }) => {
    const [user, setUser] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setUser(getSession());
        }
    }, [isOpen]);

    if (!isOpen || !video) return null;

    // Permissions Logic
    const isMainTeam = user?.role === 'main_team';
    const isTeamLead = user?.role === 'team_lead';
    // Find if the lead is in the right department
    let userDeps = [];
    if (user?.departments) {
        try {
            userDeps = JSON.parse(user.departments);
        } catch (e) {
            userDeps = user.departments.split(',').map(d => d.trim());
        }
    }
    const isLeadOfCurrentDept = isTeamLead && userDeps.some(d => d.toLowerCase() === video.currentDepartment?.toLowerCase());

    const canUpload = isMainTeam || isLeadOfCurrentDept;

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
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
                width: '650px',
                maxWidth: '90%',
                maxHeight: '90vh',
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

                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h3>
                    <div style={{
                        backgroundColor: 'var(--background-color)',
                        padding: '20px',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        fontSize: '15px',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {video.description || "No description provided."}
                    </div>
                </div>

                {/* Assets Section */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Attached Files</h3>
                    <div style={{
                        backgroundColor: 'var(--background-color)',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border-color)',
                        padding: '5px'
                    }}>
                        <AssetList videoId={video.id} refreshTrigger={refreshTrigger} />
                    </div>
                </div>

                {/* Upload Section - Only for Authorized Roles */}
                {canUpload && (
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Upload New Asset</h3>
                        <FileUploader
                            videoId={video.id}
                            department={isMainTeam ? 'Main Team' : video.currentDepartment}
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>
                )}

                <div style={{
                    marginTop: '30px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '20px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius-sm)',
                            color: 'black',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailsModal;
