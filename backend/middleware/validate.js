const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = {};
    for (const key of ['body', 'query', 'params']) {
      if (schema[key]) {
        const result = schema[key].safeParse(req[key]);
        if (!result.success) {
          const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }));
          throw ApiError.badRequest('Validation failed', errors);
        }
        parsed[key] = result.data;
      }
    }
    req.validated = parsed;
    next();
  } catch (error) {
    if (error.isOperational) {
      next(error);
    } else {
      next(error);
    }
  }
};

module.exports = validate;
