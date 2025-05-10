import { describe, it, expect } from 'vitest';

// Функция для тестирования
function sum(a, b) {
  return a + b;
}

describe('Basic Tests', () => {
  it('sum should work correctly', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });
}); 