const NoneValue = undefined;
type NoneType = undefined;

export class Maybe<T> {
  private readonly value: T | NoneType;

  constructor(value: T | NoneType) {
    this.value = value;
  }

  get isSome() {
    return this.value !== NoneValue;
  }

  get isNone() {
    return this.value === NoneValue;
  }

  unwrap(): T {
    if (this.value === NoneValue) {
      throw Error("Unwrapping None");
    }
    return this.value;
  }

  unwrapOr(def: T): T {
    if (this.value === NoneValue) {
      return def;
    }
    return this.value;
  }
}

export const None = <T>() => new Maybe<T>(NoneValue);
export const Some = <T>(v: T) => new Maybe<T>(v);
