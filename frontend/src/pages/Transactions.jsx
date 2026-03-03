import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import { Plus, Trash2, Search, Filter, AlertCircle } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        category: 'Food',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        type: 'EXPENSE'
    });
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'Health', 'General', 'Salary', 'Investment'];

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await transactionService.getAllTransactions();
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await transactionService.createTransaction(formData);
            setFormData({
                amount: '',
                category: 'Food',
                description: '',
                transactionDate: new Date().toISOString().split('T')[0],
                type: 'EXPENSE'
            });
            setShowAdd(false);
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this transaction?')) {
            try {
                await transactionService.deleteTransaction(id);
                fetchTransactions();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Transactions</h1>
                    <p className="text-slate-400 mt-1">Manage your income and expenses</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Transaction</span>
                </button>
            </header>

            {showAdd && (
                <div className="card max-w-2xl mx-auto border border-sky-500/30">
                    <h2 className="text-xl font-bold text-white mb-6">New Transaction</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                value={formData.transactionDate}
                                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    className={`flex-1 py-2 rounded-xl border transition-all ${formData.type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}
                                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                                > Income </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-2 rounded-xl border transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}
                                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                                > Expense </button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                            > Cancel </button>
                            <button type="submit" className="btn-primary px-8"> Save Transaction </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transaction List */}
            <div className="card overflow-hidden !p-0">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-white/5">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            placeholder="Search transactions..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Category</th>
                                <th className="px-6 py-4 font-bold">Description</th>
                                <th className="px-6 py-4 font-bold">Type</th>
                                <th className="px-6 py-4 font-bold text-right">Amount</th>
                                <th className="px-6 py-4 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {t.transactionDate}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-sky-500/10 text-sky-400 rounded-md text-xs font-medium">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                                        <div className="flex items-center gap-2">
                                            {t.description}
                                            {t.anomaly && (
                                                <div className="relative group/tip">
                                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 group-hover/tip:scale-100 transition-all bg-rose-900 text-rose-100 text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                                                        AI detected this as an anomaly
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={t.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-400'}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-slate-500">
                                        No transactions found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
