"use client";

import { useState, useEffect } from 'react';
import { Download, FileText, Music, Video, File } from 'lucide-react';

export default function AssetList({ videoId, refreshTrigger }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (videoId) {
            fetchAssets();
        }
    }, [videoId, refreshTrigger]);

    const fetchAssets = async () => {
        try {
            const res = await fetch(`/api/assets?videoId=${videoId}`);
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ fontSize: '12px', color: '#666' }}>Loading files...</div>;
    if (assets.length === 0) return null;

    const getIcon = (type) => {
        if (type.includes('pdf')) return <FileText size={14} />;
        if (type.includes('audio')) return <Music size={14} />;
        if (type.includes('video')) return <Video size={14} />;
        return <File size={14} />;
    };

    return (
        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Project Files
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {assets.map((asset) => (
                    <a
                        key={asset.id}
                        href={asset.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#ccc',
                            textDecoration: 'none',
                            fontSize: '13px',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {getIcon(asset.fileType || '')}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {asset.fileName.split('-').slice(3).join('-') || asset.fileName}
                        </span>
                        <Download size={12} style={{ color: '#666' }} />
                    </a>
                ))}
            </div>
        </div>
    );
}
