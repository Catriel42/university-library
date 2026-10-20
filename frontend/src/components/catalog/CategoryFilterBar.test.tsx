import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilterBar, CATEGORIES } from './CategoryFilterBar';

describe('CategoryFilterBar', () => {
  it('renders all categories from predefined list', () => {
    render(
      <CategoryFilterBar selectedSubject="" onSelectCategory={jest.fn()} />
    );

    expect(screen.getByText('Subjects:')).toBeInTheDocument();
    CATEGORIES.forEach((cat) => {
      expect(
        screen.getByRole('button', { name: cat.label })
      ).toBeInTheDocument();
    });
  });

  it('highlights the selected subject pill', () => {
    render(
      <CategoryFilterBar
        selectedSubject="science"
        onSelectCategory={jest.fn()}
      />
    );

    const scienceBtn = screen.getByRole('button', { name: 'Science' });
    expect(scienceBtn).toHaveClass('border-accent');
  });

  it('calls onSelectCategory with clicked category id', () => {
    const handleSelect = jest.fn();
    render(
      <CategoryFilterBar selectedSubject="" onSelectCategory={handleSelect} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Computer Science' }));
    expect(handleSelect).toHaveBeenCalledWith('computers');
  });
});
