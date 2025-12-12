import Decimal from "decimal.js";

Decimal.set({
  toExpNeg: -1000,
  toExpPos: 1000,
  precision: 100,
});

// Decimal with desired configuration
export default Decimal;
