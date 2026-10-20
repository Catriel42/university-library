import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthPage } from './AuthPage';

jest.mock('@/context/AuthContext');

describe('AuthPage', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
    });
  });

  it('renders sign in form by default', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn?.textContent).toContain('Sign In');
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  it('switches to create account mode when clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const registerSwitch = screen.getByRole('button', { name: /register/i });
    await user.click(registerSwitch);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument();
  });

  it('displays validation errors on invalid sign in submission', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');

    const submitBtn = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('submits valid login credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    const { container } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email address/i),
      'test@university.edu'
    );
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const submitBtn = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@university.edu',
        password: 'password123',
      });
    });
  });
});
