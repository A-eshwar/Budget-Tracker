import React, { useState, useEffect } from 'react';
import budgetService from '../services/budgetService';
import transactionService from '../services/transactionService';
import { Target, Wallet, TrendingUp, Edit3, Plus, Calendar } from 'lucide-react';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        category: 'Food',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'Health', 'General'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [budgetRes, transRes] = await Promise.all([
                budgetService.getAllBudgets(),
                transactionService.getAllTransactions()
            ]);
            setBudgets(budgetRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await budgetService.setBudget(formData);
            fetchData();
            setFormData({ ...formData, amount: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const calculateSpent = (category, month, year) => {
        return transactions
            .filter(t => {
                const d = new Date(t.transactionDate);
                return t.type === 'EXPENSE' &&
                    t.category === category &&
                    (d.getMonth() + 1) === Number(month) &&
                    d.getFullYear() === Number(year);
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Budgets</h1>
                    <p className="text-slate-400 mt-2 font-medium">Set monthly limits and track your discipline.</p>
                </div>
                <div className="hidden md:flex items-center gap-3 glass px-4 py-2 rounded-2xl border-white/5">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span className="text-white font-bold text-sm">
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="card h-fit sticky top-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-sky-500/10 rounded-xl">
                            <Plus className="w-5 h-5 text-sky-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">New Target</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Category</label>
                            <select
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Limit Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Month</label>
                                <input
                                    type="number"
                                    min="1" max="12"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Year</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full py-4 shadow-sky-500/20">
                            Save Budget Target
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {budgets.map(b => {
                            const spent = calculateSpent(b.category, b.month, b.year);
                            const percent = Math.min(Math.round((spent / b.amount) * 100), 100);
                            const isOver = spent > b.amount;

                            return (
                                <div key={b.id} className="card group hover:border-sky-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">{b.category}</h3>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                                {new Date(b.year, b.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className={`p-2 rounded-xl ${isOver ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500'}`}>
                                            <Target className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Spent</p>
                                                <p className={`text-2xl font-black ${isOver ? 'text-rose-500' : 'text-white'}`}>
                                                    ₹{spent.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Limit</p>
                                                <p className="text-lg font-bold text-slate-300">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>

                                        <div className="relative pt-2">
                                            <div className="flex mb-2 items-center justify-between text-xs">
                                                <div className="font-bold text-slate-400">{percent}% used</div>
                                                <div className="text-slate-500 font-bold">₹{Math.max(0, b.amount - spent).toLocaleString('en-IN')} left</div>
                                            </div>
                                            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-800">
                                                <div
                                                    style={{ width: `${percent}%` }}
                                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${isOver ? 'bg-rose-500' : 'bg-sky-500'}`}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {budgets.length === 0 && !loading && (
                            <div className="md:col-span-2 card flex flex-col items-center justify-center py-20 border-dashed border-2 border-white/5 bg-transparent">
                                <Wallet className="w-16 h-16 mb-6 text-slate-700" />
                                <h3 className="text-xl font-bold text-white mb-2">No Active Budgets</h3>
                                <p className="text-slate-500 text-sm max-w-xs text-center">Set your first budget target to start tracking your spending habits with AI.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Budgets;
