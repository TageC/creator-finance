import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    }}>
      <style>{`
        .cl-rootBox { width: 100% !important; }
        .cl-card { box-shadow: none !important; border: none !important; background: white !important; }
        .cl-main { background: white !important; border-radius: 12px !important; }
        .cl-headerTitle { color: #1a1a2e !important; font-size: 22px !important; font-weight: 700 !important; }
        .cl-headerSubtitle { color: #666 !important; font-size: 14px !important; }
        .cl-formButtonPrimary { background: #00d4ff !important; color: white !important; font-weight: 600 !important; }
        .cl-formButtonPrimary:hover { background: #00b8d4 !important; }
        .cl-formFieldLabel { color: #1a1a2e !important; font-weight: 600 !important; font-size: 14px !important; }
        .cl-input { border: 1px solid #ddd !important; border-radius: 6px !important; font-size: 14px !important; }
        .cl-input:focus { border-color: #00d4ff !important; }
        .cl-dividerText { color: #999 !important; }
        .cl-footerActionLink { color: #00d4ff !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💎</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>CreatorFinance</h1>
          <p style={{ color: '#ccc', fontSize: '14px' }}>Manage your creator earnings</p>
        </div>

        {/* Login Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <SignIn />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '25px', color: '#aaa', fontSize: '12px' }}>
          <p>YouTube • Twitch • Stripe • And more</p>
        </div>
      </div>
    </div>
  );
};

export default Login;