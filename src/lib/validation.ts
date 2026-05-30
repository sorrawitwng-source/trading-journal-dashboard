type PositionInputErrors = {
  buyDate?: string;
  symbol?: string;
  buyPrice?: string;
  quantity?: string;
  sellDate?: string;
  sellPrice?: string;
};

export type PositionInputResult =
  | {
      valid: true;
      value: {
        symbol: string;
        buyDate: string;
        buyPrice: number;
        quantity: number;
        sellDate?: string;
        sellPrice?: number;
      };
      errors: {};
    }
  | {
      valid: false;
      errors: PositionInputErrors;
    };

export function validatePositionInput(
  symbolInput: string,
  buyPriceInput: string,
  quantityInput = "",
  buyDateInput = todayDateString(),
  sellPriceInput = "",
  sellDateInput = "",
): PositionInputResult {
  const symbol = symbolInput.trim();
  const buyPriceText = buyPriceInput.trim();
  const quantityText = quantityInput.trim();
  const buyDateText = normalizeDateInput(buyDateInput.trim());
  const sellPriceText = sellPriceInput.trim();
  const sellDateText = normalizeDateInput(sellDateInput.trim());
  const errors: PositionInputErrors = {};

  if (!symbol) {
    errors.symbol = 'Enter a stock symbol.';
  }

  if (!buyDateText) {
    errors.buyDate = 'Enter a buy date.';
  } else if (!isValidDateText(buyDateText)) {
    errors.buyDate = 'Buy date must be a valid date.';
  }

  if (!buyPriceText) {
    errors.buyPrice = 'Enter a buy price.';
  } else {
    const buyPrice = Number(buyPriceText);

    if (Number.isNaN(buyPrice)) {
      errors.buyPrice = 'Buy price must be a number.';
    } else if (buyPrice <= 0) {
      errors.buyPrice = 'Buy price must be greater than 0.';
    }
  }

  if (quantityText) {
    const quantity = Number(quantityText);

    if (Number.isNaN(quantity)) {
      errors.quantity = 'Quantity must be a number.';
    } else if (quantity < 0) {
      errors.quantity = 'Quantity cannot be negative.';
    }
  }

  if (sellPriceText) {
    const sellPrice = Number(sellPriceText);

    if (Number.isNaN(sellPrice)) {
      errors.sellPrice = 'Sell price must be a number.';
    } else if (sellPrice <= 0) {
      errors.sellPrice = 'Sell price must be greater than 0.';
    }

    if (!sellDateText) {
      errors.sellDate = 'Enter a sell date.';
    }
  }

  if (sellDateText) {
    if (!isValidDateText(sellDateText)) {
      errors.sellDate = 'Sell date must be a valid date.';
    } else if (!sellPriceText) {
      errors.sellPrice = 'Enter a sell price.';
    } else if (
      isValidDateText(buyDateText) &&
      new Date(sellDateText) < new Date(buyDateText)
    ) {
      errors.sellDate = 'Sell date cannot be before buy date.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      symbol: symbol.toUpperCase(),
      buyDate: buyDateText,
      buyPrice: Number(buyPriceText),
      quantity: quantityText ? Number(quantityText) : 0,
      ...(sellDateText ? { sellDate: sellDateText } : {}),
      ...(sellPriceText ? { sellPrice: Number(sellPriceText) } : {}),
    },
    errors: {},
  };
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function displayDateString(value: string): string {
  const normalizedDate = normalizeDateInput(value);

  if (!isValidDateText(normalizedDate)) {
    return value;
  }

  const [year, month, day] = normalizedDate.split("-");

  return `${day}/${month}/${year}`;
}

export function normalizeDateInput(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return value;
  }

  const [, day, month, year] = match;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function isValidDateText(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
