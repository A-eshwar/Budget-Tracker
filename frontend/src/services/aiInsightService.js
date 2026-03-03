import api from './api';

const getInsights = () => {
    return api.get('/insights');
};

const aiInsightService = {
    getInsights
};

export default aiInsightService;
