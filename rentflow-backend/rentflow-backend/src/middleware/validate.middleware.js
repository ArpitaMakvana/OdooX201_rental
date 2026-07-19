import { AppError } from '../utils/AppError.js';

/**
 * Builds middleware that validates `req[source]` against a Zod schema
 * *before* the request reaches a controller. On success, `req[source]`
 * is replaced with the parsed (and coerced/trimmed) data so downstream
 * code can trust its shape.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source]
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(AppError.badRequest('Validation failed', details));
    }

    req[source] = result.data;
    next();
  };
}

export default validate;
