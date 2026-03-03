import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-[#0f172a] text-slate-200">
            <Navbar />
            <main className="pt-24 px-8 pb-12 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
