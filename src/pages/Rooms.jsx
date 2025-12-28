import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Home, CheckCircle, XCircle, Upload, MousePointer2, Edit, Trash } from 'lucide-react';
import '../index.css';
import { API_BASE_URL } from '../apiConfig';

const Rooms = () => {
    const location = useLocation();

    // Initial Rooms Data
    const [rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms/getallrooms`);
            if (response.ok) {
                const data = await response.json();
                const mappedRooms = data.map(room => ({
                    id: room.id,
                    number: room.roomNumber || 'N/A',
                    type: room.roomType ? (room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1).toLowerCase()) : 'Single',
                    acType: room.acType || 'AC',
                    price: room.pricePerNight || 0,
                    status: room.status ? (room.status.charAt(0).toUpperCase() + room.status.slice(1).toLowerCase()) : 'Active',
                    image: room.imageUrl || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=300'
                }));
                setRooms(mappedRooms);
            } else {
                throw new Error('Failed to fetch rooms');
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (location.state && location.state.filter) {
            setFilter(location.state.filter);
        }
    }, [location.state]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [formData, setFormData] = useState({ number: '', type: 'Single', acType: 'AC', price: '', status: 'Active', image: '' });

    const filteredRooms = filter === 'All' ? rooms : rooms.filter(room => room.status === filter);

    const resetForm = () => {
        setFormData({ number: '', type: 'Single', acType: 'AC', price: '', status: 'Active', image: '' });
        setIsEditing(false);
        setCurrentRoomId(null);
        setShowModal(false);
        setSelectedFile(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (room) => {
        setFormData({
            number: room.number,
            type: room.type,
            acType: room.acType,
            price: room.price,
            status: room.status,
            image: room.image
        });
        setIsEditing(true);
        setCurrentRoomId(room.id);
        setShowModal(true);
    };

    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setFormData({ ...formData, image: imageUrl });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('roomNumber', formData.number);
        data.append('pricePerNight', formData.price);
        data.append('roomType', formData.type.toUpperCase());
        data.append('acType', formData.acType.toUpperCase());
        data.append('status', formData.status.toUpperCase());
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        try {
            let response;
            if (isEditing) {
                response = await fetch(`${API_BASE_URL}/api/rooms/updateroom-with-image/${currentRoomId}`, {
                    method: 'PUT',
                    body: data
                });
            } else {
                response = await fetch(`${API_BASE_URL}/api/rooms/addrooms`, {
                    method: 'POST',
                    body: data
                });
            }

            if (response.ok) {
                fetchRooms();
                resetForm();
            } else {
                console.error("Failed to save room");
            }
        } catch (error) {
            console.error("Error saving room:", error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms/${id}/status?status=${newStatus.toUpperCase()}`, {
                method: 'PATCH'
            });
            if (response.ok) {
                fetchRooms();
            }
        } catch (error) {
            console.error("Error changing status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/rooms/delete/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchRooms();
                } else {
                    alert('Failed to delete room. Please check if there are dependencies.');
                }
            } catch (error) {
                console.error("Error deleting room:", error);
                alert('An error occurred while trying to delete the room.');
            }
        }
    };

    const getCapacity = (type) => {
        if (type === 'Single') return 2;
        if (type === 'Double') return 3;
        if (type === 'Dormitory') return 1;
        return 2;
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 className="h1 text-gradient">Room Management</h1>
                    <p className="text-dim" style={{ marginTop: '0.25rem' }}>View and manage all room details and availability.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-primary glow-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                    <Plus size={20} /> ADD NEW ROOM
                </button>
            </header>

            <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {['All', 'Active', 'Inactive', 'Maintenance'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={filter === status ? 'btn-primary' : 'btn-glass'}
                        style={{
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {filteredRooms.map(room => {
                    const isPremium = Number(room.price) >= 1000;
                    const isBest = String(room.number) === '101';

                    return (
                        <div
                            key={room.id}
                            className={`ai-card animate-fade-in ${room.status === 'Maintenance' ? 'animate-pulse-glow' : ''}`}
                            style={{
                                padding: '0',
                                border: isBest ? '2px solid var(--primary)' : isPremium ? '1px solid var(--secondary)' : '1px solid var(--glass-border)',
                                boxShadow: isBest ? '0 0 20px var(--primary-glow)' : isPremium ? '0 0 15px rgba(6, 182, 212, 0.1)' : 'none'
                            }}
                        >
                            <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                                <img
                                    src={room.image}
                                    alt="Room"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s transform' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                    <span className={
                                        room.status === 'Active' ? 'status-glow-success' :
                                            room.status === 'Inactive' ? 'status-glow-warning' : 'status-glow-danger'
                                    } style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '2rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        background: room.status === 'Active' ? 'var(--success)' :
                                            room.status === 'Inactive' ? 'var(--warning)' : 'var(--danger)',
                                        color: '#fff',
                                        display: 'block'
                                    }}>{room.status}</span>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3
                                            className={(isBest || isPremium) ? 'h3 text-gradient' : 'h3'}
                                            style={{ color: 'white', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textShadow: isBest ? '0 0 10px rgba(255,255,255,0.2)' : 'none' }}
                                        >
                                            ROOM {room.number}
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                {isBest && <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '0.5rem',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    fontWeight: '900',
                                                    letterSpacing: '0.5px',
                                                    textTransform: 'uppercase'
                                                }}>TOP RATED</span>}
                                                {isPremium && <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '0.5rem',
                                                    background: 'var(--secondary)',
                                                    color: 'white',
                                                    fontWeight: '900',
                                                    letterSpacing: '0.5px',
                                                    textTransform: 'uppercase'
                                                }}>PREMIUM</span>}
                                            </div>
                                        </h3>
                                        <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {room.type} • {room.acType?.replace('_', ' ')} • {getCapacity(room.type)} GUESTS
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="h3 glow-text" style={{ color: 'var(--primary)', margin: 0 }}>₹{room.price}</p>
                                        <p className="text-dim" style={{ fontSize: '0.65rem' }}>PER NIGHT</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => toggleStatus(room.id, room.status)}
                                        className="btn-glass"
                                        style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem'
                                        }}>
                                        <MousePointer2 size={14} /> STATUS TOGGLE
                                    </button>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => openEditModal(room)}
                                            className="btn-glass"
                                            style={{ flex: 1, padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="btn-glass"
                                            style={{ flex: 1, padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(2, 6, 23, 0.8)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100
                }}>
                    <div className="ai-card" style={{
                        padding: '2.5rem',
                        width: '100%',
                        maxWidth: '540px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid var(--glass-border-bright)'
                    }}>
                        <h2 className="h2 text-gradient" style={{ marginBottom: '2rem' }}>{isEditing ? 'UPDATE ROOM DETAILS' : 'ADD NEW ROOM'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: '220px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '1.25rem',
                                border: '2px dashed var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ color: 'var(--text-dim)', textAlign: 'center' }}>
                                        <Upload size={32} style={{ marginBottom: '0.75rem', color: 'var(--primary)' }} />
                                        <p style={{ fontWeight: '700', fontSize: '0.8rem' }}>UPLOAD ROOM PHOTO</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.4rem', display: 'block' }}>ROOM NUMBER</label>
                                    <input
                                        placeholder="e.g. 301"
                                        value={formData.number}
                                        onChange={e => setFormData({ ...formData, number: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.4rem', display: 'block' }}>PRICE / NIGHT</label>
                                    <input
                                        placeholder="e.g. 1500"
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.4rem', display: 'block' }}>ROOM TYPE</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600', appearance: 'none' }}
                                    >
                                        <option style={{ background: '#020617' }}>Single</option>
                                        <option style={{ background: '#020617' }}>Double</option>
                                        <option style={{ background: '#020617' }}>Dormitory</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.4rem', display: 'block' }}>AC TYPE</label>
                                    <select
                                        value={formData.acType}
                                        onChange={e => setFormData({ ...formData, acType: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600', appearance: 'none' }}
                                    >
                                        <option style={{ background: '#020617' }} value="AC">AC</option>
                                        <option style={{ background: '#020617' }} value="NON_AC">NON-AC</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.4rem', display: 'block' }}>STATUS</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600', appearance: 'none' }}
                                >
                                    <option style={{ background: '#020617' }}>Active</option>
                                    <option style={{ background: '#020617' }}>Inactive</option>
                                    <option style={{ background: '#020617' }}>Maintenance</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={resetForm} className="btn-glass" style={{ flex: 1, fontWeight: '700' }}>CANCEL</button>
                                <button type="submit" className="btn-primary glow-primary" style={{ flex: 1, fontWeight: '800' }}>{isEditing ? 'SAVE CHANGES' : 'CREATE ROOM'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;
