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
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: 'white',
        }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '15px',
          }}>💎</div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}>CreatorFinance</h1>
          <p style={{
            color: '#b0b0b0',
            fontSize: '16px',
          }}>Manage your creator earnings in one place</p>
        </div>

        {/* Sign In Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          <SignIn />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#b0b0b0',
          fontSize: '14px',
        }}>
          <p>Track YouTube • Twitch • Stripe • And more</p>
        </div>
      </div>
    </div>
  );
};

export default Login;