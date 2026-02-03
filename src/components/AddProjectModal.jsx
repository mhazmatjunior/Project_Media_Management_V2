"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ name, description });
        setName('');
        setDescription('');
        onClose();
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
        }}>
            <div style={{
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                width: '500px',
                padding: '30px',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
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
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '24px',
                    fontSize: '24px',
                    fontWeight: 'bold'
                }}>Add New Project</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'var(--background-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '16px'
                            }}
                            placeholder="Enter project name..."
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'var(--background-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '16px',
                                resize: 'none'
                            }}
                            placeholder="Enter project description..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 24px',
                                backgroundColor: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: 'var(--border-radius-sm)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Add Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectModal;
