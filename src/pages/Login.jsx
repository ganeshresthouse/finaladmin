import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import '../index.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/dashboard');
        } else {
            setError('INVALID USERNAME OR PASSWORD');
        }
    };

    return (
        <main style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            padding: '2rem',
            position: 'relative'
        }}>
            <div className="ai-card animate-fade-in" style={{
                padding: '4rem 3rem',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid var(--glass-border-bright)',
                zIndex: 1
            }}>
                <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div
                        className="glow-primary"
                        style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            margin: '0 auto 2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', fontWeight: '800', color: 'white'
                        }}>
                        <Shield size={40} />
                    </div>
                    <h1 className="h1 text-gradient" style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
                        Admin Portal
                    </h1>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'var(--primary)',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        letterSpacing: '2px',
                        textTransform: 'uppercase'
                    }}>
                        Login Version 4.0
                    </div>
                </header>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                    <div>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1.1rem 1.1rem 1.1rem 3.5rem',
                                    borderRadius: '0.8rem',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    outline: 'none',
                                    transition: 'var(--transition)'
                                }}
                                placeholder="USERNAME"
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1.1rem 1.1rem 1.1rem 3.5rem',
                                    borderRadius: '0.8rem',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    outline: 'none',
                                    transition: 'var(--transition)'
                                }}
                                placeholder="PASSWORD"
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="animate-fade-in" style={{
                            color: 'var(--danger)',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            letterSpacing: '0.5px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary glow-primary"
                        style={{
                            padding: '1.25rem',
                            fontSize: '0.9rem',
                            fontWeight: '800',
                            marginTop: '1rem',
                            letterSpacing: '1px'
                        }}
                    >
                        LOGIN TO DASHBOARD
                    </button>

                    <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: '600', opacity: 0.5 }}>
                        SECURE LOGIN PORTAL
                    </p>
                </form>
            </div>

            {/* Background Decorative Element */}
            <div style={{
                position: 'fixed',
                bottom: '-10%',
                right: '-5%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                zIndex: 0
            }}></div>
        </main>
    );
};

export default Login;

