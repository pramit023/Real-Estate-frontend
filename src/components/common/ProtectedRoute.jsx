import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const roleHome = {
  admin: "/admin-dashboard",
  seller: "/dashboard",
  buyer: "/",
};

const ProtectedRoute = ({ children, requiredRole, allowedRoles, allowGuest = false, guestOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='loader'></div>
      </div>
    );
  }

  const allowedRolesList = allowedRoles || (requiredRole ? [requiredRole] : []);

  if (guestOnly && user) {
    return <Navigate to={roleHome[user.role] || "/"} replace />;
  }

  if (guestOnly || (allowGuest && !user)) {
    return children || <Outlet />;
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (user && allowedRolesList.length > 0 && !allowedRolesList.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || "/"} replace />;
  }

  return children || <Outlet />;
};

export const PublicRoute = ({ children }) => (
  <ProtectedRoute allowGuest>
    {children}
  </ProtectedRoute>
);

export const GuestRoute = ({ children }) => (
  <ProtectedRoute guestOnly>{children}</ProtectedRoute>
);

export const BuyerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["buyer"]}>{children}</ProtectedRoute>
);

export const SellerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["seller"]}>{children}</ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
