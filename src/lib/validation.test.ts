import { describe, expect, it } from 'vitest';
import { validatePositionInput } from './validation';

describe('validatePositionInput', () => {
  it('requires a symbol', () => {
    expect(validatePositionInput('', '120', '0')).toEqual({
      valid: false,
      errors: { symbol: 'Enter a stock symbol.' },
    });
  });

  it('requires a buy price', () => {
    expect(validatePositionInput('AAPL', '', '0')).toEqual({
      valid: false,
      errors: { buyPrice: 'Enter a buy price.' },
    });
  });

  it('rejects a non-numeric buy price', () => {
    expect(validatePositionInput('AAPL', 'abc', '0')).toEqual({
      valid: false,
      errors: { buyPrice: 'Buy price must be a number.' },
    });
  });

  it('rejects a buy price less than or equal to zero', () => {
    expect(validatePositionInput('AAPL', '0', '0')).toEqual({
      valid: false,
      errors: { buyPrice: 'Buy price must be greater than 0.' },
    });
  });

  it('defaults an empty quantity to zero', () => {
    expect(validatePositionInput(' aapl ', ' 120.5 ', '')).toEqual({
      valid: true,
      value: { symbol: 'AAPL', buyPrice: 120.5, quantity: 0 },
      errors: {},
    });
  });

  it('rejects a negative quantity', () => {
    expect(validatePositionInput('AAPL', '120.5', '-1')).toEqual({
      valid: false,
      errors: { quantity: 'Quantity cannot be negative.' },
    });
  });

  it('normalizes valid input', () => {
    expect(validatePositionInput(' aapl ', ' 120.5 ', ' 25 ')).toEqual({
      valid: true,
      value: { symbol: 'AAPL', buyPrice: 120.5, quantity: 25 },
      errors: {},
    });
  });
});
