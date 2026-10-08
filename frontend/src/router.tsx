import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { CatalogPage } from '@/pages/CatalogPage';

const BookDetailPage = () => <div className="py-20 text-center text-muted">Book Detail (Coming Soon)</div>;
const MyLoansPage = () => <div className="py-20 text-center text-muted">My Loans (Coming Soon)</div>;
const AuthPage = () => <div className="py-20 text-center text-muted">Sign In (Coming Soon)</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <CatalogPage />,
      },
      {
        path: "book/:id",
        element: <BookDetailPage />,
      },
      {
        path: "loans",
        element: <MyLoansPage />,
      },
      {
        path: "login",
        element: <AuthPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      }
    ],
  },
]);
