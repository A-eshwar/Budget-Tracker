import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiInsightService from '../services/aiInsightService';
import transactionService from '../services/transactionService';
import savingService from '../services/savingService';
import alertService from '../services/alertService';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Lightbulb,
    ArrowUpRight, ArrowDownRight, Activity,
    PlusCircle, Wallet, ArrowRight, PiggyBank, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [insights, setInsights] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [savings, setSavings] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [insightsRes, transRes, savingsRes, alertsRes] = await Promise.all([
                aiInsightService.getInsights().catch(() => ({ data: null })),
                transactionService.getAllTransactions(),
                savingService.getSavings().catch(() => ({ data: [] })),
                alertService.getUnreadAlerts().catch(() => ({ data: [] }))
            ]);
            setInsights(insightsRes.data);
            setTransactions(transRes.data);
            setSavings(savingsRes.data);
            setAlerts(alertsRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    // Calculate real stats
    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);
    const balance = totalIncome - totalExpense - totalSavings;

    // Current month spending
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySpending = transactions
        .filter(t => {
            const d = new Date(t.transactionDate);
            return t.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Spending by category
    const categoryData = transactions.reduce((acc, t) => {
        if (t.type === 'EXPENSE') {
            const existing = acc.find(item => item.name === t.category);
            if (existing) existing.value += Number(t.amount);
            else acc.push({ name: t.category, value: Number(t.amount) });
        }
        return acc;
    }, []);

    // Last 6 months trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        const spending = transactions
            .filter(t => {
                const td = new Date(t.transactionDate);
                return t.type === 'EXPENSE' && td.getMonth() === m && td.getFullYear() === y;
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);
        trendData.push({ name: months[m], spending });
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">Analyzing your financial data...</p>
        </div>
    );

    const hasData = transactions.length > 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Hello, <span className="gradient-text">{user?.username || 'User'}</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Here's your real-time financial health update.</p>
                </div>
                <div className="flex items-center gap-6 glass p-4 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">AI Health Index</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-3xl font-black ${(insights?.healthScore || 0) > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {insights?.healthScore ? insights.healthScore.toFixed(2) : '0.00'}
                            </span>
                            <span className="text-slate-500 font-bold text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Efficiency</p>
                        <p className="text-3xl font-black text-sky-500 mt-1">{insights?.savingsEfficiency ? insights.savingsEfficiency.toFixed(2) : '0.00'}%</p>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet className="w-24 h-24 text-white" />
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Balance</p>
                    <h3 className="text-4xl font-black text-white mt-2">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center gap-2 mt-4 text-emerald-500 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Available Funds</span>
                    </div>
                </div>

                <div className="card group relative overflow-hidden">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Expense</p>
                    <h3 className="text-4xl font-black text-white mt-2">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center gap-2 mt-4 text-rose-500 text-sm font-bold bg-rose-500/10 w-fit px-3 py-1 rounded-full">
                        <ArrowDownRight className="w-4 h-4" />
                        <span>Total Spent</span>
                    </div>
                </div>

                <div className="card group relative overflow-hidden">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Savings</p>
                    <h3 className="text-4xl font-black text-white mt-2">₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center gap-2 mt-4 text-sky-500 text-sm font-bold bg-sky-500/10 w-fit px-3 py-1 rounded-full">
                        <PiggyBank className="w-4 h-4" />
                        <span>Secured Future</span>
                    </div>
                </div>

                <div className="card group bg-gradient-to-br from-sky-600/20 to-indigo-600/20 border-white/10">
                    <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <Link to="/transactions" className="btn-primary !py-2 !px-0 text-center flex items-center justify-center gap-2 text-xs">
                            <PlusCircle className="w-4 h-4" />
                            Add Cash
                        </Link>
                        <Link to="/savings" className="glass hover:bg-white/10 p-2 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 text-xs text-white font-bold">
                            Grow Savings
                        </Link>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="card text-center py-20 border-dashed border-2 border-white/5 bg-transparent">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity className="w-10 h-10 text-sky-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">No data yet!</h2>
                        <p className="text-slate-500 mb-8">Add your first transaction to unlock AI-powered financial insights and tracking.</p>
                        <Link to="/transactions" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
                                Spending Categories
                            </h2>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                {categoryData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border-white/5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                Spending Trend
                            </h2>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        />
                                        <Bar dataKey="spending" fill="url(#colorSky)" radius={[8, 8, 8, 8]} barSize={40} />
                                        <defs>
                                            <linearGradient id="colorSky" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 card bg-gradient-to-r from-sky-500/10 to-transparent">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/10 rounded-xl">
                                    <Lightbulb className="w-6 h-6 text-amber-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">AI Financial Insights</h2>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                                <p className="text-slate-200 leading-relaxed text-lg italic">
                                    "{insights?.recommendations || "Your spending looks optimized for now! Keep it up to reach your savings goal faster."}"
                                </p>
                            </div>
                            <div className="mt-8 flex flex-col md:flex-row gap-4">
                                <div className="flex-1 p-4 glass rounded-2xl border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Forecast</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-white">₹{insights?.predictedNextMonthExpense ? insights.predictedNextMonthExpense.toLocaleString('en-IN') : '0'}</span>
                                        <span className="text-xs text-slate-400">Next Month Est.</span>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 glass rounded-2xl border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                                    <span className="text-emerald-500 font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        Optimal Performance
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-rose-500/10 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Security Alerts</h2>
                            </div>
                            <div className="space-y-4">
                                {transactions.filter(t => t.anomaly).length > 0 || alerts.length > 0 ? (
                                    <>
                                        {alerts.slice(0, 3).map((a, i) => (
                                            <div key={`alert-${i}`} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl relative">
                                                <button onClick={async () => {
                                                    await alertService.markAsRead(a.id);
                                                    setAlerts(alerts.filter(x => x.id !== a.id));
                                                }} className="absolute top-2 right-2 text-slate-400 hover:text-white p-1">
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                                                    <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest">Budget Warning</p>
                                                </div>
                                                <p className="text-orange-100/80 text-sm font-medium">{a.message}</p>
                                            </div>
                                        ))}
                                        {transactions.filter(t => t.anomaly).slice(0, 3).map((t, i) => (
                                            <div key={`anomaly-${i}`} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TrendingUp className="w-3 h-3 text-rose-500" />
                                                    <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest">Anomaly</p>
                                                </div>
                                                <p className="text-rose-100/80 text-sm font-medium">Unusual ₹{t.amount} in {t.category}</p>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <TrendingUp className="w-6 h-6 text-emerald-500 rotate-180" />
                                        </div>
                                        <p className="text-slate-500 text-sm">No spend anomalies detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
