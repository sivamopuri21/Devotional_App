import { Link, useNavigate } from 'react-router-dom';
import { Home, Flame, ShoppingBag, Calendar, User, Bell, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = async () => {
        clearAuth();
        navigate('/');
    };

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>ॐ</span>
                    <span>Swadhrama</span>
                </div>

                <nav className={styles.nav}>
                    <Link to="/dashboard" className={styles.navItemActive}>
                        <Home size={20} /> Dashboard
                    </Link>
                    <Link to="/services" className={styles.navItem}>
                        <Flame size={20} /> Services
                    </Link>
                    <Link to="/shop" className={styles.navItem}>
                        <ShoppingBag size={20} /> Shop
                    </Link>
                    <Link to="/bookings" className={styles.navItem}>
                        <Calendar size={20} /> Bookings
                    </Link>
                    <Link to="/household" className={styles.navItem}>
                        <Users size={20} /> Household
                    </Link>
                    <Link to="/profile" className={styles.navItem}>
                        <User size={20} /> Profile
                    </Link>
                </nav>

                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} /> Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Dashboard</h1>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                        </button>
                        <div className={styles.avatar}>
                            {user?.profile?.fullName?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                {/* Welcome Banner */}
                <div className={styles.welcomeBanner}>
                    <div>
                        <h2>Welcome back, {user?.profile?.fullName?.split(' ')[0] || 'User'}! 🙏</h2>
                        <p>What devotional service do you need today?</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <section className={styles.section}>
                    <h3>Quick Services</h3>
                    <div className={styles.quickActions}>
                        <div className={styles.actionCard} style={{ background: '#fff0e6' }}>
                            <Flame color="#ff6b00" size={32} />
                            <span>Homam</span>
                        </div>
                        <div className={styles.actionCard} style={{ background: '#f5e6e6' }}>
                            <span style={{ fontSize: 24 }}>🕉️</span>
                            <span>Pooja</span>
                        </div>
                        <div className={styles.actionCard} style={{ background: '#e6f0f5' }}>
                            <span style={{ fontSize: 24 }}>⭐</span>
                            <span>Astrology</span>
                        </div>
                        <div className={styles.actionCard} style={{ background: '#e6f5e6' }}>
                            <span style={{ fontSize: 24 }}>🙏</span>
                            <span>Vratam</span>
                        </div>
                    </div>
                </section>

                {/* Upcoming Events */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3>Upcoming Events</h3>
                        <Link to="/bookings">See All</Link>
                    </div>
                    <div className={styles.eventCard}>
                        <div className={styles.eventIcon}>🎉</div>
                        <div className={styles.eventInfo}>
                            <h4>Ganesh Chaturthi</h4>
                            <p>Sep 7, 2024 • Home Pooja</p>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                            View
                        </button>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className={styles.section}>
                    <h3>Recent Activity</h3>
                    <div className={styles.activityList}>
                        <div className={styles.activityItem}>
                            <div className={styles.activityDot} />
                            <div>
                                <p className={styles.activityText}>Booked Satyanarayan Pooja</p>
                                <span className={styles.activityTime}>2 days ago</span>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityDot} />
                            <div>
                                <p className={styles.activityText}>Joined Sharma Household</p>
                                <span className={styles.activityTime}>1 week ago</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
