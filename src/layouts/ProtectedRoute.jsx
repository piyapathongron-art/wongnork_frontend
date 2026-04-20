import React from 'react';
import { Navigate, Outlet } from 'react-router';
import useUserStore from '../stores/userStore';

const ProtectedRoute = () => {
    const isLogin = useUserStore(state => state.isLogin);

    if (!isLogin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
