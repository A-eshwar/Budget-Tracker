import api from './api';

const getAllBudgets = () => {
    return api.get('/budgets');
};

const setBudget = (budget) => {
    return api.post('/budgets', budget);
};

const budgetService = {
    getAllBudgets,
    setBudget
};

export default budgetService;
