import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const CatalogPage = lazy(() =>
  import('@/pages/CatalogPage').then((m) => ({ default: m.CatalogPage }))
);
const BookDetailPage = lazy(() =>
  import('@/pages/BookDetailPage').then((m) => ({ default: m.BookDetailPage }))
);
const MyLoansPage = lazy(() =>
  import('@/pages/MyLoansPage').then((m) => ({ default: m.MyLoansPage }))
);
const MyReservationsPage = lazy(() =>
  import('@/pages/MyReservationsPage').then((m) => ({
    default: m.MyReservationsPage,
  }))
);
const MyBooksPage = lazy(() =>
  import('@/pages/MyBooksPage').then((m) => ({ default: m.MyBooksPage }))
);
const AuthPage = lazy(() =>
  import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);

const FallbackLoader = () => (
  <div className="bg-surface border-border h-48 w-full max-w-4xl animate-pulse rounded-2xl border p-6" />
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <CatalogPage />
          </Suspense>
        ),
      },
      {
        path: 'book/:id',
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <BookDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'loans',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<FallbackLoader />}>
              <MyLoansPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reservations',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<FallbackLoader />}>
              <MyReservationsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-books',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<FallbackLoader />}>
              <MyBooksPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <AuthPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
