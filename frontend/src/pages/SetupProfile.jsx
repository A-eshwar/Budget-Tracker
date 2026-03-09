import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, DollarSign, Plus, Trash2, AlertCircle } from 'lucide-react';

const SetupProfile = () => {
    const [monthlySalary, setMonthlySalary] = useState('');
    const [defaultBudgets, setDefaultBudgets] = useState([]);
    const [currentCategory, setCurrentCategory] = useState('Food');
    const [currentAmount, setCurrentAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'Health', 'General', 'Emergency Fund'];

    const { setupProfile } = useAuth();
    const navigate = useNavigate();

    const handleAddBudget = () => {
        if (!currentAmount || isNaN(currentAmount)) return;
        if (defaultBudgets.some(b => b.category === currentCategory)) {
            setError('Category already added.');
            return;
        }
        setError('');
        setDefaultBudgets([...defaultBudgets, { category: currentCategory, amount: parseFloat(currentAmount) }]);
        setCurrentAmount('');
    };

    const handleRemoveBudget = (index) => {
        setDefaultBudgets(defaultBudgets.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // UX Safety Net: Flush any un-added input into the budgets array before submitting
        let finalBudgets = [...defaultBudgets];
        if (currentAmount && !isNaN(currentAmount) && !finalBudgets.some(b => b.category === currentCategory)) {
            finalBudgets.push({
                category: currentCategory,
                amount: parseFloat(currentAmount)
            });
        }

        try {
            await setupProfile({
                monthlySalary: parseFloat(monthlySalary),
                defaultBudgets: finalBudgets
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="card w-full max-w-lg p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white text-center">Complete Your Profile</h1>
                    <p className="text-slate-400 mt-2 text-center">Let's set up your basic financial details to get started.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Monthly Salary</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                placeholder="e.g. 5000"
                                value={monthlySalary}
                                onChange={(e) => setMonthlySalary(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-5 mt-5">
                        <label className="block text-sm font-medium text-emerald-400 mb-4">Set Default Monthly Budgets</label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                            <div className="md:col-span-5">
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all"
                                    value={currentCategory}
                                    onChange={(e) => setCurrentCategory(e.target.value)}
                                >
                                    {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-5 relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder="Amount"
                                    value={currentAmount}
                                    onChange={(e) => setCurrentAmount(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleAddBudget}
                                    className="w-full h-full min-h-[48px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {defaultBudgets.length > 0 && (
                            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                                {defaultBudgets.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{b.category}</span>
                                            <span className="text-emerald-400 text-sm font-bold">${b.amount.toFixed(2)} / month</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveBudget(i)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupProfile;
