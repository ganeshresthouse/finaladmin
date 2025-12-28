import { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';
import '../index.css';
import { API_BASE_URL } from '../apiConfig';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            const mappedData = data.map(booking => ({
                id: String(booking.id),
                guest: booking.guestName,
                room: booking.roomNumber,
                type: booking.roomType.charAt(0).toUpperCase() + booking.roomType.slice(1).toLowerCase(),
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                price: booking.amount,
                status: booking.status === 'CHECKED_IN' ? 'Checked In' :
                    booking.status === 'CHECKED_OUT' ? 'Checked Out' :
                        booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase(),
                phone: booking.phone || 'N/A'
            }));
            setBookings(mappedData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCheckIn = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings/check-in/${id}`, {
                method: 'PUT'
            });
            if (response.ok) {
                fetchBookings();
            } else {
                alert('Check-in sequence failed. Please verify guest credentials.');
            }
        } catch (error) {
            console.error('Check-in error:', error);
        }
    };

    const handleCheckOut = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings/check-out/${id}`, {
                method: 'PUT'
            });
            if (response.ok) {
                fetchBookings();
            } else {
                alert('Check-out sequence failed. Please verify clearing details.');
            }
        } catch (error) {
            console.error('Check-out error:', error);
        }
    };

    const handleWhatsApp = (booking) => {
        const phone = booking.phone.replace(/\D/g, '');
        if (!phone) {
            alert('No valid phone number found for this guest.');
            return;
        }
        const message = encodeURIComponent(`Hello *${booking.guest}*, this is from *Ganesh Resthouse*. We are looking forward to your stay in *Room ${booking.room}* (${booking.type}). Check-in: *${booking.checkIn}*, Check-out: *${booking.checkOut}*. Thank you!`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredBookings = bookings.filter(b =>
        b.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Confirmed': return { color: 'var(--success)', icon: <CheckCircle size={14} /> };
            case 'Checked In': return { color: 'var(--primary)', icon: <CheckCircle size={14} /> };
            case 'Checked Out': return { color: 'var(--text-dim)', icon: <CheckCircle size={14} /> };
            case 'Pending': return { color: 'var(--warning)', icon: <Clock size={14} /> };
            case 'Cancelled': return { color: 'var(--danger)', icon: <XCircle size={14} /> };
            default: return { color: 'var(--text-dim)', icon: <Clock size={14} /> };
        }
    };

    return (
        <div style={{ width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 className="h1 text-gradient">Booking Records</h1>
                    <p className="text-dim" style={{ marginTop: '0.25rem' }}>View and manage all guest reservations.</p>
                </div>

                <div className="glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="Search by Guest or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: 'none',
                                color: 'white',
                                width: '300px',
                                outline: 'none',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="ai-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Booking ID</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Guest Name</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Room Number</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Check-In</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Check-Out</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Contact</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Amount Paid</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Status</th>
                                <th style={{ padding: '0.75rem 1rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => {
                                const state = getStatusStyles(booking.status);
                                return (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem' }}>#{booking.id}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    className="glow-primary"
                                                    style={{
                                                        width: '32px', height: '32px', borderRadius: '10px',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', fontWeight: '800', fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {booking.guest.charAt(0)}
                                                </div>
                                                <div style={{ color: 'white', fontWeight: '700', fontSize: '0.85rem' }}>{booking.guest}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontWeight: '700', color: 'white' }}>Room {booking.room}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{booking.type}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '700' }}>{booking.checkIn}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '700' }}>{booking.checkOut}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.5px' }}>{booking.phone}</div>
                                                <button
                                                    onClick={() => handleWhatsApp(booking)}
                                                    style={{
                                                        background: 'rgba(37, 211, 102, 0.1)',
                                                        border: '1px solid rgba(37, 211, 102, 0.2)',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.3rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        color: '#25D366',
                                                        transition: 'var(--transition)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(37, 211, 102, 0.2)';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                    title="Send WhatsApp Message"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div className="glow-text" style={{ fontWeight: '800', color: 'var(--success)', fontSize: '0.9rem' }}>₹{booking.price}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{
                                                padding: '0.3rem 0.75rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.65rem',
                                                background: `rgba(${state.color === 'var(--success)' ? '16, 185, 129' : state.color === 'var(--primary)' ? '59, 130, 246' : state.color === 'var(--warning)' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                                                color: state.color,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                border: `1px solid rgba(${state.color === 'var(--success)' ? '16, 185, 129' : state.color === 'var(--primary)' ? '59, 130, 246' : state.color === 'var(--warning)' ? '245, 158, 11' : '239, 68, 68'}, 0.2)`
                                            }}>
                                                {state.icon}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {booking.status === 'Confirmed' || booking.status === 'Pending' ? (
                                                <button
                                                    onClick={() => handleCheckIn(booking.id)}
                                                    className="btn-primary glow-primary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem', fontWeight: '800', width: '90px' }}
                                                >
                                                    CHECK-IN
                                                </button>
                                            ) : booking.status === 'Checked In' ? (
                                                <button
                                                    onClick={() => handleCheckOut(booking.id)}
                                                    className="btn-glass"
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        width: '100px',
                                                        color: 'var(--warning)',
                                                        borderColor: 'rgba(245, 158, 11, 0.3)',
                                                        background: 'rgba(245, 158, 11, 0.05)'
                                                    }}
                                                >
                                                    CHECK-OUT
                                                </button>
                                            ) : (
                                                <div style={{ width: '90px', display: 'flex', justifyContent: 'center' }}>
                                                    <CheckCircle size={16} className="text-secondary" style={{ opacity: 0.5 }} />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Bookings;
