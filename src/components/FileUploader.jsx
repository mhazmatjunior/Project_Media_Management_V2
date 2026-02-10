"use client";

import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';

export default function FileUploader({ videoId, department, onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadedUrl(null);
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);

            // 1. Get Presigned URL
            const startRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                    videoId,
                    department
                }),
            });

            if (!startRes.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, fileKey } = await startRes.json();

            // 2. Upload to R2
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadRes.ok) throw new Error('Upload to storage failed');

            // 3. Save Metadata
            // Construct the public URL (assuming we use the one from env or just store the key)
            // Ideally backend sends us the final public URL, or we construct it.
            // For now, let's use the fileKey as the reference.
            const saveRes = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId,
                    department,
                    fileName: fileKey, // Storing key
                    fileUrl: fileKey,  // Using key as URL for now (backend generates presigned GET)
                    fileType: file.type,
                    size: file.size
                }),
            });

            if (!saveRes.ok) throw new Error('Failed to save file metadata');

            setUploadedUrl(fileKey);
            if (onUploadComplete) onUploadComplete(fileKey);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            {!file ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                    <Upload size={24} style={{ marginBottom: '8px', color: 'var(--text-secondary)' }} />
                    <p style={{ fontSize: '14px', margin: 0 }}>Click to upload {department} file</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            ) : !uploadedUrl ? (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <File size={16} style={{ marginRight: '8px' }} />
                        <span style={{ fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                        </span>
                        <X
                            size={16}
                            style={{ marginLeft: '8px', cursor: 'pointer', color: '#ef4444' }}
                            onClick={() => setFile(null)}
                        />
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                </div>
            ) : (
                <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircle size={24} style={{ marginBottom: '8px' }} />
                    <span>Upload Complete</span>
                </div>
            )}
        </div>
    );
}
