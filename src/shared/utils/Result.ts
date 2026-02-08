export class Result<T, E = Error> {
  private readonly _value: T;
  private readonly _error: E;
  private readonly _isSuccess: boolean;

  private constructor(value: T, error: E, isSuccess: boolean) {
    this._value = value;
    this._error = error;
    this._isSuccess = isSuccess;
  }

  public get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access value of failed result');
    }
    return this._value;
  }

  public get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot access error of successful result');
    }
    return this._error;
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public static success<T>(value: T): Result<T, never> {
    return new Result(value, null as never, true);
  }

  public static failure<E>(error: E): Result<never, E> {
    return new Result(null as never, error, false);
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success(fn(this._value));
    }
    return Result.failure(this._error);
  }

  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this._isSuccess) {
      return Result.success(this._value);
    }
    return Result.failure(fn(this._error));
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value);
    }
    return Result.failure(this._error);
  }
}