class AuthError extends Error {
  constructor(message) {
    super(message);

    this.name = "AuthError";
  }
}

class PageError extends Error {
  constructor(message) {
    super(message);

    this.name = "PageError";
  }
}

export { AuthError, PageError };
