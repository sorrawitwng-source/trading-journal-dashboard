type PositionInputErrors = {
  symbol?: string;
  buyPrice?: string;
  quantity?: string;
};

export type PositionInputResult =
  | {
      valid: true;
      value: {
        symbol: string;
        buyPrice: number;
        quantity: number;
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
): PositionInputResult {
  const symbol = symbolInput.trim();
  const buyPriceText = buyPriceInput.trim();
  const quantityText = quantityInput.trim();
  const errors: PositionInputErrors = {};

  if (!symbol) {
    errors.symbol = 'Enter a stock symbol.';
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

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      symbol: symbol.toUpperCase(),
      buyPrice: Number(buyPriceText),
      quantity: quantityText ? Number(quantityText) : 0,
    },
    errors: {},
  };
}
