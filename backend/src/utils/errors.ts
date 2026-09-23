export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = 'INTERNAL_ERROR',
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string) {
    super(message, 501, 'NOT_IMPLEMENTED');
  }
}
