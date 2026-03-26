import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    
    const [formData, setFormData] = useState({
        monthlySalary: '',
        age: '',
        dependents: '0',
        occupation: 'Professional',
        cityTier: 'Tier_2',
        rent: '0',
        loanRepayment: '0',
        insurance: '0',
        desiredSavingsPercentage: '20'
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                monthlySalary: user.monthlySalary || '',
                age: user.age || '',
                dependents: user.dependents || '0',
                occupation: user.occupation || 'Professional',
                cityTier: user.cityTier || 'Tier_2',
                rent: user.rent || '0',
                loanRepayment: user.loanRepayment || '0',
                insurance: user.insurance || '0',
                desiredSavingsPercentage: user.desiredSavingsPercentage || '20'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await updateProfile({
                monthlySalary: parseFloat(formData.monthlySalary),
                age: parseInt(formData.age, 10),
                dependents: parseInt(formData.dependents, 10),
                occupation: formData.occupation,
                cityTier: formData.cityTier,
                rent: parseFloat(formData.rent) || 0,
                loanRepayment: parseFloat(formData.loanRepayment) || 0,
                insurance: parseFloat(formData.insurance) || 0,
                desiredSavingsPercentage: parseFloat(formData.desiredSavingsPercentage) || 0,
            });
            setSuccess('Profile updated successfully! AI Models are now using your latest data.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-emerald-500" />
                    My Profile
                </h1>
                <p className="text-slate-400 font-medium">Update your lifestyle metrics and financials to keep AI predictions highly accurate.</p>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-emerald-400 font-medium">{success}</p>
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Monthly Income / Salary</label>
                            <input type="number" name="monthlySalary" required min="0" step="0.01"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.monthlySalary} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Age</label>
                            <input type="number" name="age" required min="18" max="120"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.age} onChange={handleChange} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Dependents</label>
                            <input type="number" name="dependents" required min="0" max="20"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.dependents} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Occupation</label>
                            <select name="occupation" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                                value={formData.occupation} onChange={handleChange}>
                                <option value="Professional" className="bg-slate-900 text-white">Professional</option>
                                <option value="Self_Employed" className="bg-slate-900 text-white">Self Employed</option>
                                <option value="Student" className="bg-slate-900 text-white">Student</option>
                                <option value="Retired" className="bg-slate-900 text-white">Retired</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">City Tier</label>
                            <select name="cityTier" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                                value={formData.cityTier} onChange={handleChange}>
                                <option value="Tier_1" className="bg-slate-900 text-white">Tier 1 (Metro)</option>
                                <option value="Tier_2" className="bg-slate-900 text-white">Tier 2</option>
                                <option value="Tier_3" className="bg-slate-900 text-white">Tier 3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Monthly Rent / Mortgage</label>
                            <input type="number" name="rent" required min="0" step="0.01"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.rent} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Monthly Loan Repayments</label>
                            <input type="number" name="loanRepayment" required min="0" step="0.01"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.loanRepayment} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Monthly Insurance</label>
                            <input type="number" name="insurance" required min="0" step="0.01"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.insurance} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                Desired Savings Goal (%)
                                <span className="text-emerald-500">(Impacts Efficiency Score)</span>
                            </label>
                            <input type="number" name="desiredSavingsPercentage" required min="0" max="100" step="0.1"
                                className="w-full md:w-1/2 bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-2xl"
                                value={formData.desiredSavingsPercentage} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 tracking-widest uppercase text-sm"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
