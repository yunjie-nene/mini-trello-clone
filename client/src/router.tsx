import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import Board from './components/Board';
import BoardList from './views/BoardsList';

// Define the application routes
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <BoardList />,
      },
      {
        path: 'board/:boardId',
        element: <Board />,
      }
    ]
  }
];

// Create and export the router
const router = createBrowserRouter(routes);

export default router;