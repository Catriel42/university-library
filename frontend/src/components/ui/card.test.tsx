import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card component', () => {
  it('renders all compound card sections correctly', () => {
    render(
      <Card data-testid="card-root">
        <CardHeader>
          <CardTitle>Book Title</CardTitle>
          <CardDescription>Book Subtitle</CardDescription>
        </CardHeader>
        <CardContent>Book details content</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card-root')).toBeInTheDocument();
    expect(screen.getByText('Book Title')).toBeInTheDocument();
    expect(screen.getByText('Book Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Book details content')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });

  it('supports size prop attribute', () => {
    render(<Card size="sm" data-testid="small-card" />);
    expect(screen.getByTestId('small-card')).toHaveAttribute('data-size', 'sm');
  });
});
