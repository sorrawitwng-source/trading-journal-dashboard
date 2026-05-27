import { describe, expect, it } from 'vitest';
import { validatePositionInput } from './validation';

describe('validatePositionInput', () => {
  it('requires a symbol', () => {
    expect(validatePositionInput('', '120')).toEqual({
      valid: false,
      errors: { symbol: 'Enter a stock symbol.' },
    });
  });

  it('requires a buy price', () => {
    expect(validatePositionInput('AAPL', '')).toEqual({
      valid: false,
      errors: { buyPrice: 'Enter a buy price.' },
    });
  });

  it('rejects a non-numeric buy price', () => {
    expect(validatePositionInput('AAPL', 'abc')).toEqual({
      valid: false,
      errors: { buyPrice: 'Buy price must be a number.' },
    });
  });

  it('rejects a buy price less than or equal to zero', () => {
    expect(validatePositionInput('AAPL', '0')).toEqual({
      valid: false,
      errors: { buyPrice: 'Buy price must be greater than 0.' },
    });
  });

  it('normalizes valid input', () => {
    expect(validatePositionInput(' aapl ', ' 120.5 ')).toEqual({
      valid: true,
      value: { symbol: 'AAPL', buyPrice: 120.5 },
      errors: {},
    });
  });
});
