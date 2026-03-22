import api from './api';

const getUserAlerts = () => {
    return api.get('/alerts');
};

const getUnreadAlerts = () => {
    return api.get('/alerts/unread');
};

const markAsRead = (id) => {
    return api.put(`/alerts/${id}/read`);
};

const alertService = {
    getUserAlerts,
    getUnreadAlerts,
    markAsRead
};

export default alertService;
