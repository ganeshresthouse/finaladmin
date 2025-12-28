import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BedDouble, CalendarDays, LogOut, Image } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { path: '/rooms', icon: BedDouble, label: 'Rooms' },
        { path: '/bookings', icon: CalendarDays, label: 'Book' },
        { path: '/banners', icon: Image, label: 'Banners' },
    ];

    return (
        <aside className="glass" style={{
            width: '100px',
            height: 'calc(100vh - 40px)',
            margin: '20px',
            borderRadius: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2.5rem 1rem',
            position: 'sticky',
            top: '20px',
        }}>
            <div style={{ marginBottom: '3rem' }}>
                <div
                    className="glow-primary"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: 'white'
                    }}
                >
                    G
                </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem' }}>
                {navItems.map(({ path, icon: Icon, label }) => (
                    <Link
                        key={path}
                        to={path}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 0',
                            borderRadius: '1.25rem',
                            textDecoration: 'none',
                            color: isActive(path) ? 'var(--primary)' : 'var(--text-dim)',
                            background: isActive(path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            border: isActive(path) ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                            transition: 'var(--transition)',
                            width: '100%',
                            boxShadow: isActive(path) ? '0 0 15px rgba(59, 130, 246, 0.1)' : 'none',
                        }}
                    >
                        <Icon size={24} style={{ filter: isActive(path) ? 'drop-shadow(0 0 8px var(--primary-glow))' : 'none' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: isActive(path) ? '700' : '500', letterSpacing: '0.05em' }}>
                            {label.toUpperCase()}
                        </span>
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', width: '100%' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem 0',
                        borderRadius: '1.25rem',
                        color: 'var(--danger)',
                        background: 'transparent',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        width: '100%',
                        transition: 'var(--transition)',
                        opacity: 0.7,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                    <LogOut size={24} />
                    <span>LOGOUT</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

