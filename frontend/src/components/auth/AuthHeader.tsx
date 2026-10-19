interface AuthHeaderProps {
  mode: 'login' | 'register';
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-text mb-2 font-serif text-3xl tracking-tight">
        {mode === 'login' ? 'Welcome back' : 'Create an account'}
      </h1>
      <p className="text-muted font-sans text-sm">
        {mode === 'login'
          ? 'Access your library card, active loans, and holds'
          : 'Sign up to borrow books and access university collections'}
      </p>
    </div>
  );
}
