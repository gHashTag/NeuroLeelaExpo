import { vi, describe, it, expect } from 'vitest';

// Create a simple mock
const mockFn = vi.fn().mockResolvedValue('success');

describe('Basic test functionality', () => {
  it('should pass a simple test', async () => {
    const result = await mockFn();
    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('success');
  });
  
  it('should work with numbers', () => {
    expect(1 + 1).toBe(2);
  });
}); 