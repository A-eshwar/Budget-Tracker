import api from './api';

const chat = (message) => {
    return api.post('/ai/chat', { message });
};

const aiService = {
    chat
};

export default aiService;
