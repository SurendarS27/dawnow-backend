import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 shadow-sm z-30 flex justify-between items-center px-6 transition-all duration-300">
            {/* Left Side: Logo */}
            <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                    <span className="font-bold text-lg text-gray-800">JJCET CFRD</span>
                </div>
            </div>

            {/* Center: Title Section */}
            <div className="text-center flex-1 hidden lg:block">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight heading-font">
                    Centre for Research & Development
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
                    JJ College of Engineering & Technology
                </p>
            </div>

            {/* Right Side: User Profile */}
            <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                    <p className="text-sm font-bold text-gray-800 uppercase leading-tight">
                        {user?.name || 'User Name'}
                    </p>
                    <p className="text-[10px] font-black text-primary-green uppercase tracking-widest opacity-80">
                        {user?.role || 'Staff'} Member
                    </p>
                </div>

                <div className="group relative">
                    <button className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-full border border-gray-100 hover:bg-gray-100 transition-all shadow-sm">
                        <div className="w-9 h-9 bg-primary-green/10 rounded-full flex items-center justify-center text-primary-green font-bold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-green" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Settings</p>
                        </div>
                        <button
                            onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/staff/profile')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout System</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
