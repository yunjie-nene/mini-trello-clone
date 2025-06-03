import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App, { ProtectedRoute, PublicRoute } from './App';
import Board from './components/Board';
import BoardsList from './views/BoardsList';
import Login from './views/Login';
import Register from './views/Register';
import PageNotFound from './views/PageNotFound';

// Define the application routes
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <BoardsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'board/:boardId',
        element: (
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: '*',
        element: <PageNotFound />
      }
    ]
  }
];

// Create and export the router
const router = createBrowserRouter(routes);

export default router;