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

const deleteYearBudget = (year) => {
    return api.delete(`/budgets/year/${year}`);
};

const deleteMonthBudget = (month, year) => {
    return api.delete(`/budgets/month/${month}/${year}`);
};

const deleteCategoryYearBudget = (category, year) => {
    return api.delete(`/budgets/category-year/${category}/${year}`);
};

const deleteDefaultBudget = (category) => {
    return api.delete(`/budgets/default/${category}`);
};

const deletePermanentBudget = (category, year) => {
    return api.delete(`/budgets/permanent/${category}/${year}`);
};

const setDefaultBudget = (budget) => {
    return api.post('/budgets/default', budget);
};

const budgetService = {
    getAllBudgets,
    setBudget,
    setDefaultBudget,
    deleteBudget,
    deleteYearBudget,
    deleteMonthBudget,
    deletePermanentBudget,
    deleteDefaultBudget
};

export default budgetService;
