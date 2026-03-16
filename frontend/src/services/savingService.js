import api from './api';

const getSavings = () => {
    return api.get('/savings');
};

const addOrUpdateSaving = (savingData) => {
    return api.post('/savings', savingData);
};

const deleteSaving = (id) => {
    return api.delete(`/savings/${id}`);
};

const savingService = {
    getSavings,
    addOrUpdateSaving,
    deleteSaving
};

export default savingService;
