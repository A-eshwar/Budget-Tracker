import api from './api';

const getAllTransactions = () => {
    return api.get('/transactions');
};

const createTransaction = (transaction) => {
    return api.post('/transactions', transaction);
};

const deleteTransaction = (id) => {
    return api.delete(`/transactions/${id}`);
};

const updateTransaction = (id, transaction) => {
    return api.put(`/transactions/${id}`, transaction);
};

const transactionService = {
    getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
};

export default transactionService;
