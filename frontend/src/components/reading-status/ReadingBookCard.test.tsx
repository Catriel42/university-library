import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReadingBookCard } from './ReadingBookCard';
import {
  ReadingStatus,
  type ReadingStatusDTO,
} from '@university-library/shared';

const readingItem: ReadingStatusDTO = {
  id: 'rs-1',
  workId: '/works/OL700W',
  userId: 'usr-1',
  title: 'Cryptonomicon',
  firstAuthor: 'Neal Stephenson',
  coverId: 777,
  status: ReadingStatus.READING,
  updatedAt: '2026-10-15T10:00:00.000Z',
};

describe('ReadingBookCard', () => {
  it('renders book info and toggles to Completed on action button click', () => {
    const handleStatusChange = jest.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ReadingBookCard
          book={readingItem}
          onStatusChange={handleStatusChange}
          onClear={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Cryptonomicon')).toBeInTheDocument();
    expect(screen.getByText('Neal Stephenson')).toBeInTheDocument();

    const markCompletedBtn = screen.getByRole('button', {
      name: /mark completed/i,
    });
    expect(markCompletedBtn).toBeInTheDocument();

    fireEvent.click(markCompletedBtn);
    expect(handleStatusChange).toHaveBeenCalledWith(
      '/works/OL700W',
      ReadingStatus.COMPLETED
    );
  });

  it('triggers onClear when remove button is clicked', () => {
    const handleClear = jest.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ReadingBookCard
          book={readingItem}
          onStatusChange={jest.fn()}
          onClear={handleClear}
        />
      </MemoryRouter>
    );

    const removeBtn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);
    expect(handleClear).toHaveBeenCalledWith('/works/OL700W');
  });
});
