import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/earnings', label: 'Earnings', icon: '💰' },
    { path: '/expenses', label: 'Expenses', icon: '💸' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{
      width: open ? '280px' : '80px',
      backgroundColor: '#1a1a2e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      transition: 'width 0.3s ease',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    }}>
      {/* Logo */}
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#00d4ff',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}>
        {open ? '💎 CreatorFinance' : '💎'}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive(item.path) ? '#00d4ff' : '#b0b0b0',
              backgroundColor: isActive(item.path) ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              borderLeft: isActive(item.path) ? '3px solid #00d4ff' : '3px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(0, 212, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '20px', minWidth: '30px' }}>{item.icon}</span>
            {open && <span style={{ marginLeft: '15px', fontSize: '16px' }}>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: open ? 'flex-start' : 'center',
      }}>
        <UserButton />
      </div>
    </div>
  );
};
export default Sidebar;