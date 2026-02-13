import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import analyticaLogo from '../../styles/images/Analytica-text.png';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/main-dashboard',
      icon: 'BarChart3',
      tooltip: 'Real-time lead generation overview and KPI monitoring'
    },
    {
      label: 'Campaigns',
      path: '/campaign-performance',
      icon: 'Mail',
      tooltip: 'Email outreach analytics and performance monitoring'
    },
    {
      label: 'Lead Analytics',
      path: '/lead-analytics-sheet',
      icon: 'Database',
      tooltip: 'Comprehensive lead database management with advanced filtering'
    },
    {
      label: 'Settings',
      path: '/settings-dashboard',
      icon: 'Settings',
      tooltip: 'System configuration and API management'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle mobile menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={20} />
      </button>
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={analyticaLogo} alt="Analytica" className="sidebar-brand-img" style={{ height: '22px', objectFit: 'contain' }} />
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationItems?.map((item, index) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`sidebar-nav-item animate-stagger ${
                isActive(item?.path) ? 'active' : ''
              }`}
              title={isCollapsed ? item?.tooltip : ''}
              aria-label={item?.label}
              aria-current={isActive(item?.path) ? 'page' : undefined}
            >
              <Icon name={item?.icon} size={20} />
              <span className="sidebar-nav-item-text">{item?.label}</span>
            </button>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-6 left-4 right-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="caption text-muted-foreground text-xs">
                © 2026 ANALYTICA
              </p>
              <p className="caption text-muted-foreground text-xs mt-1">
                Lead Intelligence Platform
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;