import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Earnings from './pages/Earnings';
import Expenses from './pages/Expenses';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <SignedOut>
          <Login />
        </SignedOut>
        <SignedIn>
          <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main style={{ 
              flex: 1, 
              overflowY: 'auto',
              marginLeft: sidebarOpen ? 0 : 0,
              transition: 'margin-left 0.3s ease',
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </SignedIn>
      </Router>
    </ClerkProvider>
  );
};
export default App;