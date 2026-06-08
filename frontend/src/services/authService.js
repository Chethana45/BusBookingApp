import api from './api';

const mockUser = {
  id: 1,
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  role: 'customer',
};

const TOKEN_KEY = 'authToken';

export const login = async ({ email, password }) => {
  // Replace with: return api.post('/auth/login', { email, password }).then(res => res.data);
  if (!email || !password) {
    return Promise.reject(new Error('Email and password are required.'));
  }

  const token = 'dummy-auth-token';
  localStorage.setItem(TOKEN_KEY, token);
  return Promise.resolve({ user: mockUser, token });
};

export const logout = async () => {
  // Replace with: return api.post('/auth/logout').then(res => res.data);
  localStorage.removeItem(TOKEN_KEY);
  return Promise.resolve({ success: true });
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return Promise.reject(new Error('User is not authenticated.'));
  }

  // Replace with: return api.get('/auth/me').then(res => res.data);
  return Promise.resolve(mockUser);
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem(TOKEN_KEY));
};
