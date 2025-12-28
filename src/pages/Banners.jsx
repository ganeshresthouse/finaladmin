import { useState } from 'react';
import { Upload, Image as ImageIcon, Film, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import '../index.css';
import { API_BASE_URL } from '../apiConfig';

const Banners = () => {
    const banners = [
        { id: 'MAIN', name: 'Main Hero Banner', description: 'Supports Image or Video. Best for long clips.', types: ['IMAGE', 'VIDEO'] },
        { id: 'SECOND', name: 'Secondary Promo', description: 'Image only. Used for special offers.', types: ['IMAGE'] },
        { id: 'THIRD', name: 'Third Highlight', description: 'Image only. Additional categories.', types: ['IMAGE'] }
    ];

    const [uploading, setUploading] = useState({});
    const [status, setStatus] = useState({});

    const handleUpload = async (position, file) => {
        if (!file) return;

        // Auto-detect media type
        const isVideo = file.type.startsWith('video/');
        const mediaType = isVideo ? 'VIDEO' : 'IMAGE';

        // Validation: SECOND and THIRD only allow images
        if (position !== 'MAIN' && isVideo) {
            setStatus(prev => ({
                ...prev,
                [position]: { type: 'error', message: 'Only images are allowed for this position.' }
            }));
            return;
        }

        setUploading(prev => ({ ...prev, [position]: true }));
        setStatus(prev => ({ ...prev, [position]: { type: 'loading', message: 'Uploading...' } }));

        const formData = new FormData();
        formData.append('position', position);
        formData.append('mediaType', mediaType);
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/banners/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(prev => ({
                    ...prev,
                    [position]: { type: 'success', message: 'Successfully updated!', url: data.url, isVideo }
                }));
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            setStatus(prev => ({
                ...prev,
                [position]: { type: 'error', message: 'Upload failed. Try again.' }
            }));
        } finally {
            setUploading(prev => ({ ...prev, [position]: false }));
        }
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="h1 text-gradient">Banner Management</h1>
                <p className="text-dim" style={{ marginTop: '0.25rem' }}>Control your shop's visual identity. MAIN supports video.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {banners.map((banner) => {
                    const bannerStatus = status[banner.id];
                    const isUploading = uploading[banner.id];

                    return (
                        <div key={banner.id} className="ai-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 className="h3" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{banner.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{banner.description}</p>
                                </div>
                                <div className="glass" style={{ padding: '0.5rem', borderRadius: '0.75rem' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)' }}>{banner.id}</span>
                                </div>
                            </div>

                            <div
                                style={{
                                    height: '220px',
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#0a0f1e', // Dark contrast background
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {bannerStatus?.url ? (
                                    bannerStatus.isVideo ? (
                                        <video src={bannerStatus.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <img src={bannerStatus.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    )
                                ) : (
                                    banner.id === 'MAIN' ? <Film size={40} style={{ color: 'var(--glass-border-bright)' }} /> : <ImageIcon size={40} style={{ color: 'var(--glass-border-bright)' }} />
                                )}

                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}>
                                    <input
                                        type="file"
                                        id={`file-${banner.id}`}
                                        hidden
                                        onChange={(e) => handleUpload(banner.id, e.target.files[0])}
                                        accept={banner.id === 'MAIN' ? "image/*,video/*" : "image/*"}
                                    />
                                    <label
                                        htmlFor={`file-${banner.id}`}
                                        className="btn-glass"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '800', cursor: isUploading ? 'default' : 'pointer', opacity: isUploading ? 0.5 : 1 }}
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                        {isUploading ? 'UPLOADING...' : `CHOOSE ${banner.id === 'MAIN' ? 'MEDIA' : 'IMAGE'}`}
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: '24px' }}>
                                {bannerStatus && (
                                    <>
                                        {bannerStatus.type === 'success' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                                        {bannerStatus.type === 'error' && <AlertCircle size={16} style={{ color: 'var(--danger)' }} />}
                                        {bannerStatus.type === 'loading' && <Loader2 className="animate-spin" size={16} style={{ color: 'var(--primary)' }} />}
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: bannerStatus.type === 'success' ? 'var(--success)' :
                                                bannerStatus.type === 'error' ? 'var(--danger)' : 'var(--text-dim)'
                                        }}>
                                            {bannerStatus.message}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Banners;
