import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CreatorFinance
        </Link>
        <ul className="flex gap-6 items-center">
          <li><Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link></li>
          <li><Link to="/earnings" className="text-gray-700 hover:text-blue-600 font-medium">Earnings</Link></li>
          <li><Link to="/expenses" className="text-gray-700 hover:text-blue-600 font-medium">Expenses</Link></li>
          <li><Link to="/settings" className="text-gray-700 hover:text-blue-600 font-medium">Settings</Link></li>
          <li><UserButton /></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;