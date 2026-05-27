type PositionInputErrors = {
  symbol?: string;
  buyPrice?: string;
};

export type PositionInputResult =
  | {
      valid: true;
      value: {
        symbol: string;
        buyPrice: number;
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
): PositionInputResult {
  const symbol = symbolInput.trim();
  const buyPriceText = buyPriceInput.trim();
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

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      symbol: symbol.toUpperCase(),
      buyPrice: Number(buyPriceText),
    },
    errors: {},
  };
}
