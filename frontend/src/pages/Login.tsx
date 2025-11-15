import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">CreatorFinance</h1>
        <p className="text-center text-gray-600 mb-8">Manage your creator earnings in one place</p>
        <SignIn />
      </div>
    </div>
  );
};

export default Login;