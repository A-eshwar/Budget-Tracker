import api from './api';

const login = async (username, password) => {
    const response = await api.post('/auth/signin', { username, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const register = (username, email, password) => {
    return api.post('/auth/signup', { username, email, password });
};

const setupProfile = async (data) => {
    const response = await api.post('/auth/profile-setup', data);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    setupProfile
};

export default authService;
