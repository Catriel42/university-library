import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { CatalogPage } from '@/pages/CatalogPage';
import { AuthPage } from '@/pages/AuthPage';
import { BookDetailPage } from '@/pages/BookDetailPage';
import { MyLoansPage } from '@/pages/MyLoansPage';
import { MyReservationsPage } from '@/pages/MyReservationsPage';
import { MyBooksPage } from '@/pages/MyBooksPage';
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
        path: 'reservations',
        element: (
          <ProtectedRoute>
            <MyReservationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-books',
        element: (
          <ProtectedRoute>
            <MyBooksPage />
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
