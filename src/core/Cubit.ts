import { MATH_64_BASE } from "./constants";
import Decimal from "./decimal";
import { Fixed } from "./types";

export class Cubit {
  public readonly mag: bigint;
  public readonly sign: boolean;
  public readonly val: number;

  constructor(args: Fixed) {
    this.mag = args.mag;
    this.sign = args.sign;
    const mult = this.sign ? -1 : 1;
    const val = new Decimal(this.mag).div(MATH_64_BASE).toNumber() * mult;
    this.val = val;
  }

  get asObject() {
    return {
      mag: this.mag,
      sign: this.sign,
    };
  }

  get asArray() {
    return [this.mag.toString(10), this.sign ? "1" : "0"];
  }
}
