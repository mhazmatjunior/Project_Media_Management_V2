// Simple session management using localStorage
const SESSION_KEY = 'user_session';

export const setSession = (userData) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    }
};

export const getSession = () => {
    if (typeof window !== 'undefined') {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }
    return null;
};

export const clearSession = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
};

export const isAuthenticated = () => {
    return getSession() !== null;
};
