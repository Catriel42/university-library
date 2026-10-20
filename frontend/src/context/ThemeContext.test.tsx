import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme} type="button">
        Toggle
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to dark theme when no stored preference exists', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('initializes from stored localStorage preference', () => {
    localStorage.setItem('university-library-theme', 'light');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveClass('light');
  });

  it('toggles theme and updates localStorage and document root', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(localStorage.getItem('university-library-theme')).toBe('light');
    expect(document.documentElement).toHaveClass('light');

    fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(localStorage.getItem('university-library-theme')).toBe('dark');
  });

  it('throws error when useTheme is called outside of ThemeProvider', () => {
    const renderOutside = (): void => {
      render(<TestConsumer />);
    };
    expect(renderOutside).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });
});
