import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import * as AuthContextModule from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

jest.mock('@/context/AuthContext');

describe('AppLayout', () => {
  it('renders branding and sign in link for anonymous visitors', () => {
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <ThemeProvider>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('University Library')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /my loans/i })
    ).not.toBeInTheDocument();
  });

  it('renders navigation links and user badge when authenticated', () => {
    const handleLogout = jest.fn();
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-1', email: 'alice@test.com', name: 'Alice Smith' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: handleLogout,
    });

    render(
      <ThemeProvider>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByRole('link', { name: /my loans/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /reservations/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /my books/i })).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
    fireEvent.click(signOutBtn);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('toggles mobile menu drawer on hamburger button click', () => {
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-1', email: 'alice@test.com', name: 'Alice Smith' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <ThemeProvider>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /open navigation menu/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catalog/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close navigation menu/i }));
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
  });
});
