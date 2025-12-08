import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  isJobSaved,
  saveJob,
  unsaveJob,
  toggleSaveJob,
  getSavedJobsCount,
} from '@/lib/savedJobs';

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockSelectHead = jest.fn();
const chain = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  insert: mockInsert,
  delete: mockDelete,
  order: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => chain),
  },
}));

describe('savedJobs lib', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockReturnThis();
    mockSelect.mockReturnThis();
    mockInsert.mockResolvedValue({ error: null });
    mockDelete.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
  });

  it('returns false when job not saved', async () => {
    const result = await isJobSaved('u1', 'j1');
    expect(result).toBe(false);
  });

  it('saves a job successfully', async () => {
    const ok = await saveJob('u1', 'j2');
    expect(ok).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('unsaves a job successfully', async () => {
    const ok = await unsaveJob('u1', 'j3');
    expect(ok).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it('toggles from unsaved to saved', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    const ok = await toggleSaveJob('u1', 'j4');
    expect(ok).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('gets saved jobs count', async () => {
    const selectHead = jest.fn().mockReturnThis();
    selectHead.mockResolvedValue({ count: 2, error: null });
    const fromMock = jest.requireMock('@/lib/supabase').supabase.from as any;
    fromMock.mockReturnValueOnce({ select: selectHead, eq: mockEq });

    const count = await getSavedJobsCount('u1');
    expect(count).toBe(2);
  });
});
