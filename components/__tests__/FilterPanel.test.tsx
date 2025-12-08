import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import FilterPanel, { FilterOptions } from '../FilterPanel';

jest.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock('@/constants/Theme', () => ({
  Colors: { primary: { 500: '#00f' } },
  Spacing: {},
  BorderRadius: {},
  FontSize: {},
  FontWeight: {},
  Shadow: {},
  getThemeColors: () => ({
    text: '#000',
    textSecondary: '#333',
    surface: '#fff',
    surfaceVariant: '#eee',
    border: '#ddd',
  }),
}));

const baseFilters: FilterOptions = {
  jobTypes: [],
  locations: [],
  workModes: [],
  experienceLevels: [],
  salaryRange: null,
  datePosted: 'all',
  sortBy: 'newest',
};

describe('FilterPanel', () => {
  it('toggles job type and calls onFilterChange', () => {
    const onFilterChange = jest.fn();

    const { getByText } = render(
      <FilterPanel
        filters={baseFilters}
        onFilterChange={onFilterChange}
        onClearAll={jest.fn()}
      />
    );

    fireEvent.press(getByText('Kohë e Plotë'));
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, jobTypes: ['full-time'] });
  });

  it('clears filters when clear all pressed', () => {
    const onClearAll = jest.fn();
    const activeFilters: FilterOptions = {
      ...baseFilters,
      jobTypes: ['full-time'],
      locations: ['Prishtinë'],
      workModes: ['remote'],
      experienceLevels: ['entry'],
      salaryRange: { min: 0, max: 500 },
      datePosted: 'week',
    };

    const { getByText } = render(
      <FilterPanel
        filters={activeFilters}
        onFilterChange={jest.fn()}
        onClearAll={onClearAll}
      />
    );

    fireEvent.press(getByText('Pastro të gjitha'));
    expect(onClearAll).toHaveBeenCalled();
  });
});
