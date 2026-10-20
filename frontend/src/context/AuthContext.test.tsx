import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { apiClient } from '@/lib/api';
import type { UserDTO } from '@university-library/shared';

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockUser: UserDTO = {
  id: 'usr-1',
  email: 'test@example.com',
  name: 'Test User',
};

function TestAuthConsumer() {
  const { user, isLoading, login, logout } = useAuth();
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <span data-testid="user-email">{user ? user.email : 'anonymous'}</span>
      <button
        onClick={() =>
          login({ email: 'test@example.com', password: 'password123' })
        }
        type="button"
      >
        Login
      </button>
      <button onClick={() => logout()} type="button">
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks session on mount and sets user when valid', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
    });
  });

  it('handles unauthenticated session on mount', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized')
    );

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('anonymous');
    });
  });

  it('handles login flow successfully', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized')
    );
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('anonymous');
    });

    await act(async () => {
      screen.getByRole('button', { name: /login/i }).click();
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'test@example.com'
    );
  });
});
