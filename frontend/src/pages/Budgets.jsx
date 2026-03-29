import React, { useState, useEffect } from 'react';
import budgetService from '../services/budgetService';
import transactionService from '../services/transactionService';
import { Target, Wallet, TrendingUp, Edit3, Plus, Calendar, Trash2, Check, X, AlertCircle } from 'lucide-react';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isEditingOverride, setIsEditingOverride] = useState(false);
    const [modalDeleteId, setModalDeleteId] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showDeleteOverrideModal, setShowDeleteOverrideModal] = useState(false);
    const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
    const [formData, setFormData] = useState({
        category: 'Food',
        amount: ''
    });

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'Health', 'General'];

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            const [budgetRes, transRes] = await Promise.all([
                budgetService.getAllBudgets(selectedMonth, selectedYear),
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSaveModal(true);
    };

    const confirmSave = async (isDefault) => {
        setShowSaveModal(false);
        try {
            if (isDefault) {
                await budgetService.setDefaultBudget({
                    ...formData
                });
            } else {
                await budgetService.setBudget({
                    ...formData,
                    month: selectedMonth,
                    year: selectedYear
                });
            }
            fetchData();
            setFormData({ category: 'Food', amount: '' });
            setIsEditingOverride(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (budget) => {
        setFormData({
            category: budget.category,
            amount: budget.amount
        });
        setIsEditingOverride(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({ category: 'Food', amount: '' });
        setIsEditingOverride(false);
    };

    const handleDeleteClick = (budget) => {
        setModalDeleteId(budget.id);
        setPendingDeleteCategory(budget.category);
        setShowDeleteOverrideModal(true);
    };

    const cancelDelete = () => {
        setModalDeleteId(null);
        setShowDeleteOverrideModal(false);
        setPendingDeleteCategory(null);
    };

    const confirmDelete = async (scope) => {
        let success = false;
        try {
            if (scope === 'single' && modalDeleteId) {
                await budgetService.deleteBudget(modalDeleteId);
                success = true;
            } else if (scope === 'category-year' && pendingDeleteCategory) {
                // If they choose "Delete for Year Permanently", we delete both overrides and the default budget in one atomic operation
                await budgetService.deletePermanentBudget(pendingDeleteCategory, selectedYear);
                success = true;
            } else if (scope === 'single' && !modalDeleteId && pendingDeleteCategory) {
                 // For a default budget card, "Revert to Default" acts as "Keep" or close modal
                 // We simply close the modal by letting it finish
            }

            if (success && pendingDeleteCategory) {
                // Instantly remove the deleted budget from the local state for immediate feedback
                setBudgets(prev => prev.filter(b => b.category !== pendingDeleteCategory));
            }
        } catch (err) {
            console.error(err);
            alert(`Error: Could not delete budget for ${pendingDeleteCategory}. Please try again later.`);
        } finally {
            setModalDeleteId(null);
            setShowDeleteOverrideModal(false);
            setPendingDeleteCategory(null);
            // Refresh to ensure full state sync
            if (success) {
                fetchData();
            }
        }
    };


    const calculateSpent = (category) => {
        return transactions
            .filter(t => {
                const d = new Date(t.transactionDate);
                return t.type === 'EXPENSE' &&
                    t.category === category &&
                    (d.getMonth() + 1) === selectedMonth &&
                    d.getFullYear() === selectedYear;
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
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl border-white/5">
                        <Calendar className="w-4 h-4 text-sky-500" />
                        <select 
                            className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer appearance-none"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {months.map(m => <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>)}
                        </select>
                        <span className="text-white/30 font-bold mx-1">/</span>
                        <input 
                            type="number" 
                            className="bg-transparent text-white font-bold text-sm focus:outline-none w-16"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="card h-fit sticky top-8 border-t-4 border-t-sky-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`p-2 rounded-xl bg-sky-500/10`}>
                            {isEditingOverride ? <Edit3 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-sky-500" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isEditingOverride ? 'Edit Budget' : 'Add New Budget'}
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                Category specific targets
                            </p>
                        </div>
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
                        <div className="flex gap-3">
                            {isEditingOverride && (
                                <button type="button" onClick={handleCancelEdit} className="px-6 py-4 rounded-xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className={`flex-1 py-4 font-bold rounded-xl text-white shadow-lg transition-all bg-gradient-to-r from-sky-500 to-indigo-600 hover:shadow-sky-500/25`}>
                                {isEditingOverride ? 'Save Changes' : 'Add Budget'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {budgets.map(b => {
                            const spent = calculateSpent(b.category);
                            const percent = Math.min(Math.round((spent / b.amount) * 100), 100);
                            const isOver = spent > b.amount;

                            return (
                                <div key={b.category + '-' + b.id} className="card group hover:border-sky-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">{b.category}</h3>
                                                {b.id && <span className="text-[10px] bg-sky-500/20 text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0">Override</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDeleteClick(b)}
                                                className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                                                title={b.id ? "Delete Override" : "Delete Budget"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(b)}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                                                title="Edit Budget"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <div className={`p-2 rounded-xl ${isOver ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500'}`}>
                                                <Target className="w-5 h-5" />
                                            </div>
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
            {/* Save Options Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="card max-w-sm w-full border border-sky-500/30 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-sky-500/10 rounded-full text-sky-500 flex-shrink-0">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Save Options</h3>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            How would you like to apply this budget for <b>{formData.category}</b>?
                        </p>
                        <div className="flex flex-col gap-3 mt-2">
                            <button onClick={() => confirmSave(true)} className="w-full px-5 py-3 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-lg shadow-sky-500/20 flex flex-col items-start px-4">
                                <span>Update for Entire Year</span>
                                <span className="text-[10px] font-medium opacity-70">Applies to all months</span>
                            </button>
                            <button onClick={() => confirmSave(false)} className="w-full px-5 py-3 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-start px-4">
                                <span>Update for This Month Only</span>
                                <span className="text-[10px] font-medium opacity-70">Only {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>
                            </button>
                            <button onClick={() => setShowSaveModal(false)} className="w-full px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Options Modal */}
            {showDeleteOverrideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="card max-w-sm w-full border border-rose-500/30 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-rose-500/10 rounded-full text-rose-500 flex-shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Delete Options</h3>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            {modalDeleteId 
                                ? `How would you like to remove the custom budget for ${pendingDeleteCategory}?`
                                : `How would you like to remove the budget for ${pendingDeleteCategory}?`}
                        </p>
                        <div className="flex flex-col gap-3 mt-2">
                            <button onClick={() => confirmDelete('single')} className="w-full px-5 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20 flex flex-col items-start px-4">
                                {modalDeleteId ? (
                                    <>
                                        <span>Revert to Default</span>
                                        <span className="text-[10px] font-medium opacity-70">Fall back to global budget for this month</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Keep Budget</span>
                                        <span className="text-[10px] font-medium opacity-70">Cancel and do not delete at this time</span>
                                    </>
                                )}
                            </button>
                            <button onClick={() => confirmDelete('category-year')} className="w-full px-5 py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20 flex flex-col items-start px-4 text-left">
                                <span>Delete Permanently</span>
                                <span className="text-[10px] font-medium opacity-70">
                                    {modalDeleteId 
                                        ? `Clear all overrides and remove the default target for ${pendingDeleteCategory}`
                                        : `Completely remove the target for ${pendingDeleteCategory}`}
                                </span>
                            </button>
                            <button onClick={cancelDelete} className="w-full px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Budgets;
