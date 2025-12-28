import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BedDouble, CalendarCheck, TrendingUp, DollarSign, Clock, CheckCircle, Activity, ArrowUpRight } from 'lucide-react';
import '../index.css';
import { API_BASE_URL } from '../apiConfig';

const Dashboard = () => {
    const navigate = useNavigate();
    const [revenueFilter, setRevenueFilter] = useState('daily');

    const [revenueData, setRevenueData] = useState({
        daily: { value: '0', subtitle: 'Fetching...', trend: '+8.2%' },
        weekly: { value: '0', subtitle: 'Fetching...', trend: '+5.4%' },
        monthly: { value: '0', subtitle: 'Fetching...', trend: '+12.1%' },
        yearly: { value: '0', subtitle: 'Fetching...', trend: '+15.3%' }
    });

    const [stats, setStats] = useState({
        active: 0,
        inactive: 0,
        maintenance: 0,
        total: 0,
        bookingsToday: 0,
        occupancy: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`);
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();

                setStats({
                    active: data.activeRooms,
                    inactive: data.inactiveRooms,
                    maintenance: data.maintenanceRooms,
                    total: data.totalRooms,
                    bookingsToday: data.newBookings,
                    occupancy: data.occupancy
                });

                const formatRevenue = (amount) => amount ? new Intl.NumberFormat('en-US').format(amount) : '0';

                setRevenueData({
                    daily: { value: formatRevenue(data.revenue.daily), subtitle: 'vs yesterday', trend: '+8.2%' },
                    weekly: { value: formatRevenue(data.revenue.weekly), subtitle: 'vs last week', trend: '+5.4%' },
                    monthly: { value: formatRevenue(data.revenue.monthly), subtitle: 'vs last month', trend: '+12.1%' },
                    yearly: { value: formatRevenue(data.revenue.yearly), subtitle: 'vs last year', trend: '+15.3%' }
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleNavigate = (path, filter = 'All') => {
        navigate(path, { state: { filter } });
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="animate-fade-in">
                    <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                    </p>
                    <h1 className="h1 text-gradient" style={{ marginBottom: '0.5rem' }}>
                        {getGreeting()}, Admin
                    </h1>
                    <p className="text-dim" style={{ fontSize: '1rem', opacity: 0.8 }}>
                        Here's what's happening at Ganesh Resthouse today.
                    </p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <AIWidget
                    title="Revenue"
                    value={`₹${revenueData[revenueFilter].value}`}
                    subtitle={revenueData[revenueFilter].subtitle}
                    trend={revenueData[revenueFilter].trend}
                    icon={<TrendingUp size={24} />}
                    color="var(--primary)"
                    onClick={() => handleNavigate('/bookings')}
                    extraContent={
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.6rem', width: 'fit-content' }} onClick={(e) => e.stopPropagation()}>
                            {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setRevenueFilter(period)}
                                    style={{
                                        background: revenueFilter === period ? 'var(--primary)' : 'transparent',
                                        color: revenueFilter === period ? 'white' : 'var(--text-dim)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        padding: '0.3rem 0.8rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {period.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    }
                />
                <AIWidget
                    title="Active Bookings"
                    value={stats.bookingsToday}
                    subtitle="Expected arrivals today"
                    trend="+12%"
                    icon={<Users size={24} />}
                    color="var(--secondary)"
                    onClick={() => handleNavigate('/bookings')}
                />
                <AIWidget
                    title="System Occupancy"
                    value={`${stats.occupancy}%`}
                    subtitle={`${stats.active} rooms currently occupied`}
                    trend="+4.2%"
                    icon={<Activity size={24} />}
                    color="var(--accent)"
                    onClick={() => handleNavigate('/rooms', 'Active')}
                />
            </div>



            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="h2" style={{ letterSpacing: '-0.5px' }}>Room Status Summary</h2>
                    <button className="btn-glass" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={() => handleNavigate('/rooms')}>View All Rooms</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                        { label: 'Total Rooms', value: stats.total, color: 'var(--text-main)', glow: '', filter: 'All' },
                        { label: 'Active Rooms', value: stats.active, color: 'var(--success)', glow: 'status-glow-success', filter: 'Active' },
                        { label: 'Inactive Rooms', value: stats.inactive, color: 'var(--warning)', glow: 'status-glow-warning', filter: 'Inactive' },
                        { label: 'Maintenance', value: stats.maintenance, color: 'var(--danger)', glow: 'status-glow-danger animate-pulse-glow', filter: 'Maintenance' }
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className={`ai-card ${stat.glow}`}
                            style={{ padding: '1.25rem 1rem', textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => handleNavigate('/rooms', stat.filter)}
                        >
                            <div className="h3" style={{ color: stat.color, fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: '800' }}>
                                {stat.value}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const AIWidget = ({ title, value, subtitle, trend, icon, color, onClick, extraContent }) => (
    <div
        onClick={onClick}
        className="ai-card"
        style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderLeft: `4px solid ${color}`,
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div
                style={{
                    background: `rgba(${color === 'var(--primary)' ? '59, 130, 246' : color === 'var(--secondary)' ? '6, 182, 212' : '99, 102, 241'}, 0.1)`,
                    padding: '0.6rem',
                    borderRadius: '0.75rem',
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {icon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.2rem 0.5rem', borderRadius: '0.6rem', fontSize: '0.7rem', fontWeight: '800' }}>
                <ArrowUpRight size={12} />
                {trend}
            </div>
        </div>

        <div style={{ marginBottom: extraContent ? '0' : '0.25rem' }}>
            <p className="text-muted" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.25rem' }}>{title.toUpperCase()}</p>
            <h3 className="glow-text" style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.1rem', color: 'white' }}>{value}</h3>
            <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '0.1rem', opacity: 0.7 }}>{subtitle}</p>
        </div>

        {extraContent}
    </div>
);

export default Dashboard;

