import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { CatalogPage } from '@/pages/CatalogPage';
import { AuthPage } from '@/pages/AuthPage';
import { BookDetailPage } from '@/pages/BookDetailPage';
import { MyLoansPage } from '@/pages/MyLoansPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <CatalogPage />,
      },
      {
        path: 'book/:id',
        element: <BookDetailPage />,
      },
      {
        path: 'loans',
        element: (
          <ProtectedRoute>
            <MyLoansPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <AuthPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
