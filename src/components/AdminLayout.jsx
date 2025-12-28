import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { API_BASE_URL } from '../apiConfig';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [latestBooking, setLatestBooking] = useState(null);
    const knownBookingIds = useRef(new Set());
    const dismissalTimerRef = useRef(null);

    // Web Audio API refs for guaranteed sound generation
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);

    // Initialize AudioContext on first interaction (required by browsers)
    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.connect(audioContextRef.current.destination);
            console.log("🔔 Notifications: Audio Context Initialized.");
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const startBeep = () => {
        initAudio();
        if (oscillatorRef.current) return; // Already beeping

        // Create a classic "digital alert" sound (Square wave at 880Hz)
        const osc = audioContextRef.current.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime);

        // Simple pulsing volume effect
        const gain = gainNodeRef.current;
        gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);

        // Rapid pulsing: 0.1s on, 0.1s off
        const now = audioContextRef.current.currentTime;
        for (let i = 0; i < 600; i++) { // Loop for 60 seconds
            gain.gain.setValueAtTime(0.1, now + (i * 0.2));
            gain.gain.setValueAtTime(0, now + (i * 0.2) + 0.1);
        }

        osc.connect(gain);
        osc.start();
        oscillatorRef.current = osc;
        console.log("🔔 Notifications: BEEP started.");
    };

    const stopBeep = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            } catch (e) { }
            oscillatorRef.current = null;
            console.log("🔔 Notifications: BEEP stopped.");
        }
    };

    // Initialize known IDs from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('admin_seen_bookings');
        if (saved) {
            try {
                const ids = JSON.parse(saved);
                ids.forEach(id => knownBookingIds.current.add(String(id)));
                console.log("🔔 Notifications: Loaded", knownBookingIds.current.size, "previous bookings.");
            } catch (e) {
                console.warn("🔔 Notifications: Cache load error", e);
            }
        }
    }, []);

    // Handle sound stopping when notification is closed
    useEffect(() => {
        if (!showNotification) {
            stopBeep();
            if (dismissalTimerRef.current) {
                clearTimeout(dismissalTimerRef.current);
                dismissalTimerRef.current = null;
            }
        }
    }, [showNotification]);

    // Global unlock for audio
    useEffect(() => {
        const unlock = () => {
            initAudio();
            window.removeEventListener('mousedown', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('mousedown', unlock);
        window.addEventListener('keydown', unlock);
        window.addEventListener('touchstart', unlock);
        return () => {
            window.removeEventListener('mousedown', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, []);

    useEffect(() => {
        const checkNewBookings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/bookings`);
                if (response.ok) {
                    const data = await response.json();

                    if (data && data.length > 0) {
                        if (knownBookingIds.current.size === 0) {
                            data.forEach(b => knownBookingIds.current.add(String(b.id)));
                            localStorage.setItem('admin_seen_bookings', JSON.stringify([...knownBookingIds.current]));
                            return;
                        }

                        const newBookings = data.filter(b => {
                            const isNew = !knownBookingIds.current.has(String(b.id));
                            if (!isNew) return false;
                            const status = b.status?.toUpperCase();
                            return status === 'CONFIRMED' || status === 'SUCCESS' || status === 'PAID' || status === 'BOOKED';
                        });

                        if (newBookings.length > 0) {
                            console.log("🔔 Notifications: NEW BOOKING DETECTED!", newBookings);
                            const latest = newBookings[newBookings.length - 1];

                            newBookings.forEach(b => knownBookingIds.current.add(String(b.id)));
                            localStorage.setItem('admin_seen_bookings', JSON.stringify([...knownBookingIds.current]));

                            setLatestBooking(latest);
                            setShowNotification(false);

                            setTimeout(() => {
                                setShowNotification(true);
                                startBeep();
                            }, 300);

                            if (dismissalTimerRef.current) clearTimeout(dismissalTimerRef.current);
                            dismissalTimerRef.current = setTimeout(() => setShowNotification(false), 60000);
                        }
                    }
                }
            } catch (error) {
                console.error("🔔 Notifications: Polling error", error);
            }
        };

        const interval = setInterval(checkNewBookings, 5000);
        checkNewBookings();

        return () => {
            clearInterval(interval);
            stopBeep();
            if (dismissalTimerRef.current) clearTimeout(dismissalTimerRef.current);
        };
    }, []);

    const handleWhatsApp = (booking) => {
        const phone = booking.phone?.replace(/\D/g, '');
        if (!phone) return;
        const type = booking.roomType?.charAt(0).toUpperCase() + booking.roomType?.slice(1).toLowerCase();
        const message = encodeURIComponent(`Hello *${booking.guestName}*, this is from *Ganesh Resthouse*. We are looking forward to your stay in *Room ${booking.roomNumber}* (${type}). Check-in: *${booking.checkIn}*, Check-out: *${booking.checkOut}*. Thank you!`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        setShowNotification(false); // This stops the sound too
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                padding: '1.5rem 2rem',
                background: 'transparent',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 1
            }}>
                <Outlet />
            </main>

            {/* Notification Popup */}
            {showNotification && latestBooking && (
                <div className="animate-fade-in" style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 9999,
                    width: '320px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--primary-glow)',
                    borderRadius: '1.25rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 15px var(--primary-glow)',
                    padding: '1.25rem',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'var(--primary)',
                                padding: '0.5rem',
                                borderRadius: '0.75rem',
                                animation: 'pulse-glow 2s infinite'
                            }}>
                                <Bell size={18} />
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>CONFIRMED BOOKING</span>
                        </div>
                        <button onClick={() => setShowNotification(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '800' }}>{latestBooking.guestName}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>Room {latestBooking.roomNumber} • {latestBooking.amount} Paid</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => { navigate('/bookings'); setShowNotification(false); }}
                            className="btn-glass"
                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.7rem', fontWeight: '800' }}
                        >
                            VIEW DETAILS
                        </button>
                        <button
                            onClick={() => handleWhatsApp(latestBooking)}
                            className="btn-primary"
                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#25D366', border: 'none' }}
                        >
                            <MessageSquare size={14} /> WHATSAPP
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;

