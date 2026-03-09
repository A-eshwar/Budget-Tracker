import api from './api';

const getAllBudgets = (month, year) => {
    return api.get('/budgets', { params: { month, year } });
};

const setBudget = (budget) => {
    return api.post('/budgets', budget);
};

const deleteBudget = (id) => {
    return api.delete(`/budgets/${id}`);
};

const setDefaultBudget = (budget) => {
    return api.post('/budgets/default', budget);
};

const budgetService = {
    getAllBudgets,
    setBudget,
    setDefaultBudget,
    deleteBudget
};

export default budgetService;
