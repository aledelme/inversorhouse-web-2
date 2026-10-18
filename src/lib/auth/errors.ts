/** Thrown by auth guards; mapped to ActionResult errors by `runAction`. */
export class AuthError extends Error {
  constructor(public readonly code: "unauthenticated" | "forbidden") {
    super(code);
    this.name = "AuthError";
  }
}

/** Expected business-rule failure with a message key under `errors.*` in messages. */
export class DomainError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "DomainError";
  }
}
