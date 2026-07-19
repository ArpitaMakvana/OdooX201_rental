/**
 * Wraps an async Express handler so any rejected promise / thrown error
 * is forwarded to `next(err)` instead of crashing the process or hanging
 * the request. Keeps controllers free of repetitive try/catch blocks.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
