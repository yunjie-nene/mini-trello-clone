import Header from './components/Header';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JSX } from 'react/jsx-runtime';

// Protected route wrapper
interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Public route wrapper (redirect to boards if already logged in)
interface PublicRouteProps {
  children: JSX.Element;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="h-screen flex flex-col">
      {isAuthenticated && <Header />}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <AuthProvider client={client}>
        <AppContent />
      </AuthProvider>
    </ApolloProvider>
  );
};

export default App;