export const getAdminToken = () => {
    // Check for adminUser object first (Startup Builder pattern)
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        try {
            const userData = JSON.parse(adminUser);
            if (userData.token) return userData.token;
        } catch (e) {
            console.error('Error parsing adminUser:', e);
        }
    }

    // Fallback to plain token (Super-Admin pattern)
    const token = localStorage.getItem('token');
    if (token && token.startsWith('eyJ') && token.length > 100) {
        return token;
    }
    return null;
};

export const adminLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
};

export const validateAdminSession = () => {
    const token = getAdminToken();
    if (!token) {
        adminLogout();
        return false;
    }
    return true;
};

export const getAuthHeaders = () => {
    if (!validateAdminSession()) {
        return {};
    }

    const token = getAdminToken();

    if (!token) {
        return {};
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};
