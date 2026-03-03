import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ReceiptText, Wallet, LogOut, TrendingUp } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 glass flex items-center justify-between px-8 z-50">
            <Link to="/" className="flex items-center gap-2">
                <TrendingUp className="text-sky-500 w-8 h-8" />
                <span className="text-xl font-bold gradient-text">SmartBudget AI</span>
            </Link>

            {user && (
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/transactions" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        <ReceiptText className="w-5 h-5" />
                        <span>Transactions</span>
                    </Link>
                    <Link to="/budgets" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        <Wallet className="w-5 h-5" />
                        <span>Budgets</span>
                    </Link>
                </div>
            )}

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400">Hi, {user.username}</span>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-slate-300 hover:text-white font-medium">Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
