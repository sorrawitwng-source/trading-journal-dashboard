import { describe, expect, it } from 'vitest';
import {
  displayDateString,
  normalizeDateInput,
  validatePositionInput,
} from './validation';

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
    expect(validatePositionInput(' aapl ', ' 120.5 ', '', '2026-05-31')).toEqual({
      valid: true,
      value: { symbol: 'AAPL', buyDate: '2026-05-31', buyPrice: 120.5, quantity: 0 },
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
    expect(validatePositionInput(' aapl ', ' 120.5 ', ' 25 ', '31/05/2026')).toEqual({
      valid: true,
      value: { symbol: 'AAPL', buyDate: '2026-05-31', buyPrice: 120.5, quantity: 25 },
      errors: {},
    });
  });

  it('accepts a sell price and sell date for closed trades', () => {
    expect(
      validatePositionInput('AAPL', '120.5', '25', '2026-05-01', '140', '2026-05-31'),
    ).toEqual({
      valid: true,
      value: {
        symbol: 'AAPL',
        buyDate: '2026-05-01',
        buyPrice: 120.5,
        quantity: 25,
        sellDate: '2026-05-31',
        sellPrice: 140,
      },
      errors: {},
    });
  });

  it('accepts optional risk plan and journal notes', () => {
    expect(
      validatePositionInput(
        'AAPL',
        '120',
        '10',
        '2026-05-01',
        '',
        '',
        '110',
        '150',
        'Breakout',
        'Volume expansion',
        'Review after earnings',
        'Calm',
      ),
    ).toEqual({
      valid: true,
      value: {
        symbol: 'AAPL',
        buyDate: '2026-05-01',
        buyPrice: 120,
        quantity: 10,
        emotion: 'Calm',
        stopLoss: 110,
        strategyTag: 'Breakout',
        targetPrice: 150,
        tradeNote: 'Review after earnings',
        tradeReason: 'Volume expansion',
      },
      errors: {},
    });
  });

  it('rejects invalid long risk plan levels', () => {
    expect(
      validatePositionInput('AAPL', '120', '10', '2026-05-01', '', '', '125', '110'),
    ).toEqual({
      valid: false,
      errors: {
        stopLoss: 'Stop loss should be below buy price.',
        targetPrice: 'Target price should be above buy price.',
      },
    });
  });

  it('rejects a sell date before the buy date', () => {
    expect(
      validatePositionInput('AAPL', '120.5', '25', '2026-05-31', '140', '2026-05-01'),
    ).toEqual({
      valid: false,
      errors: { sellDate: 'Sell date cannot be before buy date.' },
    });
  });

  it('formats stored dates as DD/MM/YYYY for editing', () => {
    expect(displayDateString('2026-05-31')).toBe('31/05/2026');
  });

  it('normalizes DD/MM/YYYY input back to ISO storage format', () => {
    expect(normalizeDateInput('3/5/2026')).toBe('2026-05-03');
  });
});
