import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles, BarChart3, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';

const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center w-full relative">

            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] -z-10 animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '2s' }} />

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-sky-500/30 text-sky-400 font-semibold text-sm mb-6 shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                    <Sparkles className="w-4 h-4" />
                    <span>Next-Generation Financial Intelligence</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                    Master Your Money with <br />
                    <span className="gradient-text">SmartBudget AI</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Take control of your financial future. Let AI track, analyze, and optimize your spending habits automatically.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <Link to="/register" className="btn-primary flex items-center gap-2 text-lg px-8 py-4 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                        Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="px-8 py-4 text-lg font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300">
                        Login to Account
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl">
                <div className="card text-left space-y-4 hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Target className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Smart Budgets</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Set dynamic budgets for different categories and let our system track your progress in real-time.
                    </p>
                </div>

                <div className="card text-left space-y-4 hover:-translate-y-2 transition-transform duration-500" style={{ transitionDelay: '100ms' }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Sparkles className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">AI Assistant</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Chat directly with your personalized financial AI. Get instant insights, tips, and spending warnings.
                    </p>
                </div>

                <div className="card text-left space-y-4 hover:-translate-y-2 transition-transform duration-500" style={{ transitionDelay: '200ms' }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center border border-sky-500/30">
                        <BarChart3 className="w-7 h-7 text-sky-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Deep Analytics</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Visualize your financial habits through beautiful, interactive charts and automated reports.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Landing;
