/**
 * An "operational" error: something we anticipated (bad input, missing
 * resource, unauthorized access) as opposed to a programming bug. The
 * global error handler uses `isOperational` to decide whether it's safe
 * to show `message` to the client or whether it should hide the details
 * behind a generic 500.
 */
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    if (details) this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = 'You are not logged in. Please log in to continue.') {
    return new AppError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new AppError(403, message);
  }

  static notFound(message = 'The requested resource was not found.') {
    return new AppError(404, message);
  }

  static conflict(message) {
    return new AppError(409, message);
  }
}

export default AppError;
