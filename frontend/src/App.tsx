import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Earnings from './pages/Earnings';
import Expenses from './pages/Expenses';
import Navbar from './components/Navbar';
import Login from './pages/Login';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <SignedOut>
          <Login />
        </SignedOut>
        <SignedIn>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
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