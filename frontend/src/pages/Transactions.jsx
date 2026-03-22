import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import savingService from '../services/savingService';
import budgetService from '../services/budgetService';
import { Plus, Trash2, Search, Filter, AlertCircle, Edit3, Check, X } from 'lucide-react';

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
    const [editId, setEditId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [savings, setSavings] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [budgetWarning, setBudgetWarning] = useState(null);

    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'Health', 'General', 'Salary', 'Investment'];

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const currentDate = new Date();
            const [transRes, savingsRes, budgetRes] = await Promise.all([
                transactionService.getAllTransactions(),
                savingService.getSavings().catch(() => ({ data: [] })),
                budgetService.getAllBudgets(currentDate.getMonth() + 1, currentDate.getFullYear()).catch(() => ({ data: [] }))
            ]);
            setTransactions(transRes.data);
            setSavings(savingsRes.data);
            setBudgets(budgetRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate balance
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);
    const availableBalance = totalIncome - totalExpense - totalSavings;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        let effectiveBalance = availableBalance;
        if (editId) {
            const originalTx = transactions.find(t => t.id === editId);
            if (originalTx && originalTx.type === 'EXPENSE') {
                effectiveBalance += Number(originalTx.amount);
            }
        }

        if (formData.type === 'EXPENSE' && Number(formData.amount) > effectiveBalance) {
            setErrorMsg(`Not enough balance. Cannot add transaction. Available balance: ₹${effectiveBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
            return;
        }

        if (formData.type === 'EXPENSE') {
            const categoryBudget = budgets.find(b => b.category === formData.category);
            if (categoryBudget) {
                const currentDate = new Date(formData.transactionDate);
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                
                let spentThisMonth = transactions
                    .filter(t => t.type === 'EXPENSE' && t.category === formData.category &&
                                 new Date(t.transactionDate).getMonth() + 1 === month &&
                                 new Date(t.transactionDate).getFullYear() === year)
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                    
                if (editId) {
                    const originalTx = transactions.find(t => t.id === editId);
                    if (originalTx && originalTx.category === formData.category &&
                        new Date(originalTx.transactionDate).getMonth() + 1 === month &&
                        new Date(originalTx.transactionDate).getFullYear() === year) {
                         spentThisMonth -= Number(originalTx.amount);
                    }
                }
                
                const newTotal = spentThisMonth + Number(formData.amount);
                if (newTotal > categoryBudget.amount) {
                    setBudgetWarning({
                        category: formData.category,
                        limit: categoryBudget.amount,
                        formData: formData,
                        editId: editId
                    });
                    return; // Pause the submission, wait for modal confirmation
                }
            }
        }

        executeSubmission(formData, editId);
    };

    const executeSubmission = async (data, editIdToUse) => {
        try {
            if (editIdToUse) {
                await transactionService.updateTransaction(editIdToUse, data);
            } else {
                await transactionService.createTransaction(data);
            }
            setFormData({
                amount: '',
                category: 'Food',
                description: '',
                transactionDate: new Date().toISOString().split('T')[0],
                type: 'EXPENSE'
            });
            setShowAdd(false);
            setEditId(null);
            setErrorMsg('');
            setBudgetWarning(null);
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (t) => {
        setFormData({
            amount: t.amount,
            category: t.category,
            description: t.description,
            transactionDate: t.transactionDate,
            type: t.type
        });
        setEditId(t.id);
        setShowAdd(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = async (id) => {
        try {
            await transactionService.deleteTransaction(id);
            setConfirmDeleteId(null);
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteId(null);
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

            {budgetWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="card max-w-md w-full border border-orange-500/30 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Budget Exceeded</h3>
                                <p className="text-orange-400 text-sm font-bold mt-1">Category: {budgetWarning.category}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            This transaction will push you over your target monthly budget of <strong className="text-white">₹{budgetWarning.limit}</strong>. 
                            A security alert will be posted to your Dashboard if you proceed.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setBudgetWarning(null)} 
                                className="px-5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => executeSubmission(budgetWarning.formData, budgetWarning.editId)} 
                                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors"
                            >
                                Add Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAdd && (
                <div className="card max-w-2xl mx-auto border border-sky-500/30">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {editId ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <p className="text-rose-200 text-sm font-medium">{errorMsg}</p>
                        </div>
                    )}
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
                                onClick={() => {
                                    setShowAdd(false);
                                    setEditId(null);
                                    setErrorMsg('');
                                    setFormData({ amount: '', category: 'Food', description: '', transactionDate: new Date().toISOString().split('T')[0], type: 'EXPENSE' });
                                }}
                                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                            > Cancel </button>
                            <button type="submit" className="btn-primary px-8"> 
                                {editId ? 'Update Transaction' : 'Save Transaction'} 
                            </button>
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
                                        {confirmDeleteId === t.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => confirmDelete(t.id)} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded" title="Confirm Delete">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={cancelDelete} className="p-1 text-slate-400 hover:bg-slate-800 rounded" title="Cancel">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    className="p-2 text-slate-600 hover:text-sky-500 transition-colors"
                                                    title="Edit Transaction"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(t.id)}
                                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
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
