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

const transactionService = {
    getAllTransactions,
    createTransaction,
    deleteTransaction
};

export default transactionService;
