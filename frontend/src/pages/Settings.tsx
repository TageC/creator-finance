import React from 'react';
import { UserProfile } from '@clerk/clerk-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <UserProfile />
      </div>
    </div>
  );
};

export default Settings;