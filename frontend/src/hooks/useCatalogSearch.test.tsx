import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { WorkDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';
import { useCatalogSearch } from './useCatalogSearch';

const mockBooks: WorkDTO[] = [
  {
    id: 'W1',
    title: 'Available Book',
    firstAuthor: 'Author A',
    totalCopies: 3,
    availableCopies: 1,
  },
  {
    id: 'W2',
    title: 'Unavailable Book',
    firstAuthor: 'Author B',
    totalCopies: 2,
    availableCopies: 0,
  },
];

describe('useCatalogSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches search results based on query parameter', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: {
        numFound: 2,
        start: 0,
        docs: mockBooks,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/?q=react']}>{children}</MemoryRouter>
    );

    const { result } = renderHook(() => useCatalogSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.numFound).toBe(2);
    expect(result.current.hasSearched).toBe(true);
  });

  it('filters results when hideUnavailable is true', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: {
        numFound: 2,
        start: 0,
        docs: mockBooks,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/?q=react&hideUnavailable=true']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCatalogSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    expect(result.current.displayedResults).toHaveLength(1);
    expect(result.current.displayedResults[0].id).toBe('W1');
  });

  it('handles search errors', async () => {
    jest.mocked(apiClient.get).mockRejectedValue(new Error('Network Error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/?q=fail']}>{children}</MemoryRouter>
    );

    const { result } = renderHook(() => useCatalogSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    expect(result.current.searchError).toBeTruthy();
    expect(result.current.results).toHaveLength(0);
  });

  it('clears query on handleClearQuery', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: { numFound: 0, start: 0, docs: [] },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/?q=react']}>{children}</MemoryRouter>
    );

    const { result } = renderHook(() => useCatalogSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    act(() => {
      result.current.handleClearQuery();
    });

    expect(result.current.inputQuery).toBe('');
  });
});
