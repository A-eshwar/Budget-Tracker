import React, { useState, useEffect } from 'react';
import savingService from '../services/savingService';
import transactionService from '../services/transactionService';
import { Plus, Minus, Trash2, PiggyBank, Calendar, AlertCircle, Check, X, Wallet } from 'lucide-react';

const Savings = () => {
    const [savings, setSavings] = useState([]);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [formData, setFormData] = useState({
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [modalDeleteId, setModalDeleteId] = useState(null);
    const [topUpId, setTopUpId] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [reduceId, setReduceId] = useState(null);
    const [reduceAmount, setReduceAmount] = useState('');
    const [error, setError] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [savingsRes, transRes] = await Promise.all([
                savingService.getSavings(),
                transactionService.getAllTransactions()
            ]);
            setSavings(savingsRes.data);
            console.log("Fetched Savings:", savingsRes.data);
            console.log("Fetched Transactions:", transRes.data);
            
            // Calculate available balance (Income - Expense - Total Savings)
            const income = transRes.data
                .filter(t => t.type && t.type.toUpperCase() === 'INCOME')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            
            const expense = transRes.data
                .filter(t => t.type && t.type.toUpperCase() === 'EXPENSE')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            
            const totalSavings = savingsRes.data.reduce((sum, s) => sum + Number(s.amount), 0);
            
            console.log("Calculated Income:", income);
            console.log("Calculated Expense:", expense);
            console.log("Calculated Total Savings:", totalSavings);
            
            setAvailableBalance(income - expense - totalSavings);
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await savingService.addOrUpdateSaving(formData);
            setFormData({
                amount: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                description: ''
            });
            setShowAdd(false);
            fetchData();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An error occurred while saving.");
            }
        }
    };

    const handleTopUpSubmit = async (e, saving) => {
        e.preventDefault();
        setError(null);
        try {
            const addedAmount = Number(topUpAmount);
            if (addedAmount <= 0) {
                setError("Please enter a valid amount to add.");
                return;
            }
            await savingService.addOrUpdateSaving({
                id: saving.id,
                amount: Number(saving.amount) + addedAmount,
                month: saving.month,
                year: saving.year,
                description: saving.description
            });
            setTopUpId(null);
            setTopUpAmount('');
            fetchData();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An error occurred while topping up saving.");
            }
        }
    };

    const handleReduceSubmit = async (e, saving) => {
        e.preventDefault();
        setError(null);
        try {
            const deductedAmount = Number(reduceAmount);
            if (deductedAmount <= 0) {
                setError("Please enter a valid amount to reduce.");
                return;
            }
            if (deductedAmount > Number(saving.amount)) {
                setError("Cannot reduce more than the current saving amount.");
                return;
            }
            await savingService.addOrUpdateSaving({
                id: saving.id,
                amount: Number(saving.amount) - deductedAmount,
                month: saving.month,
                year: saving.year,
                description: saving.description
            });
            setReduceId(null);
            setReduceAmount('');
            fetchData();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An error occurred while reducing saving.");
            }
        }
    };

    const handleDeleteClick = (id) => setModalDeleteId(id);
    const cancelDelete = () => setModalDeleteId(null);

    const confirmDelete = async () => {
        if (!modalDeleteId) return;
        try {
            await savingService.deleteSaving(modalDeleteId);
            setModalDeleteId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError("Delete error: " + err.response.data.message);
            } else {
                setError("Failed to delete saving. It may be linked elsewhere or you lack permission.");
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Savings</h1>
                    <p className="text-slate-400 mt-1">Track your monthly savings goals</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Savings</span>
                </button>
            </header>

            {/* Current Balance Card */}
            <div className="card bg-gradient-to-br from-indigo-600/20 to-sky-600/20 border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-500/20 rounded-2xl">
                        <Wallet className="w-8 h-8 text-sky-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Available for Savings</p>
                        <h3 className="text-3xl font-black text-white mt-1">₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <p className="text-rose-200 font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-white/5 rounded">
                        <X className="w-4 h-4 text-rose-500" />
                    </button>
                </div>
            )}

            {showAdd && (
                <div className="card max-w-2xl mx-auto border border-sky-500/30">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-sky-500" />
                        Add Monthly Saving
                    </h2>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Month</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                >
                                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                            > Cancel </button>
                            <button type="submit" className="btn-primary px-8"> Save </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savings.map((s) => (
                    <div key={s.id} className="card group hover:border-sky-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <PiggyBank className="w-6 h-6 text-indigo-500" />
                            </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setTopUpId(s.id); setReduceId(null); }}
                                        className="p-2 text-slate-600 hover:text-emerald-500 transition-colors"
                                        title="Top Up Savings"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setReduceId(s.id); setTopUpId(null); }}
                                        className="p-2 text-slate-600 hover:text-amber-500 transition-colors"
                                        title="Reduce Savings"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(s.id)}
                                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                        title="Delete Savings"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <Calendar className="w-3 h-3" />
                            {months[s.month - 1]} {s.year}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">₹{Number(s.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-sm text-slate-300 truncate" title={s.description}>{s.description}</p>
                        
                        {topUpId === s.id && (
                            <form onSubmit={(e) => handleTopUpSubmit(e, s)} className="mt-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2">
                                <label className="block text-xs font-medium text-slate-400 mb-1">Add Amount</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        value={topUpAmount}
                                        onChange={(e) => setTopUpAmount(e.target.value)}
                                        placeholder="e.g. 500"
                                    />
                                    <button type="submit" className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors">
                                        Add
                                    </button>
                                    <button type="button" onClick={() => { setTopUpId(null); setTopUpAmount(''); }} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {reduceId === s.id && (
                            <form onSubmit={(e) => handleReduceSubmit(e, s)} className="mt-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2">
                                <label className="block text-xs font-medium text-slate-400 mb-1">Reduce Amount</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        value={reduceAmount}
                                        onChange={(e) => setReduceAmount(e.target.value)}
                                        placeholder="e.g. 500"
                                    />
                                    <button type="submit" className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors">
                                        Reduce
                                    </button>
                                    <button type="button" onClick={() => { setReduceId(null); setReduceAmount(''); }} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ))}
            </div>

            {savings.length === 0 && !loading && (
                <div className="text-center py-20 border-dashed border-2 border-white/5 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PiggyBank className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500">No savings recorded yet.</p>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {modalDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="card max-w-sm w-full border border-rose-500/30 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-rose-500/10 rounded-full text-rose-500 flex-shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Confirm Deletion</h3>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            Are you sure you want to delete?
                        </p>
                        <div className="flex gap-3 justify-end mt-2">
                            <button onClick={cancelDelete} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Savings;
