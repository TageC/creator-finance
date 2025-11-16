import React from 'react';

const Settings: React.FC = () => {
  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px', color: '#1a1a2e' }}>⚙️ Settings</h1>

      {/* Additional Settings Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {/* Connected Platforms */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '20px',
          borderLeft: '4px solid #00d4ff',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔗</div>
          <h3 style={{ color: '#1a1a2e', marginBottom: '10px', fontWeight: 'bold' }}>Connected Platforms</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>
            Connect YouTube, Twitch, Stripe, and more
          </p>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#00d4ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00b8d4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00d4ff')}
          >
            Manage
          </button>
        </div>

        {/* Notifications */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '20px',
          borderLeft: '4px solid #00ff88',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔔</div>
          <h3 style={{ color: '#1a1a2e', marginBottom: '10px', fontWeight: 'bold' }}>Notifications</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>
            Manage your notification preferences
          </p>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#00ff88',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00dd77')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00ff88')}
          >
            Configure
          </button>
        </div>

        {/* Data Export */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '20px',
          borderLeft: '4px solid #ff6b6b',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          <h3 style={{ color: '#1a1a2e', marginBottom: '10px', fontWeight: 'bold' }}>Data Export</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>
            Export your earnings and expense data
          </p>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff5555')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b6b')}
          >
            Export
          </button>
        </div>

        {/* Account Profile */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '20px',
          borderLeft: '4px solid #ffa500',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>👤</div>
          <h3 style={{ color: '#1a1a2e', marginBottom: '10px', fontWeight: 'bold' }}>Account Profile</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>
            Manage your profile and security settings
          </p>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#ffa500',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff8c00')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffa500')}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;