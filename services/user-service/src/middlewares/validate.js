const { AppError } = require('@campuslink/shared');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[property]);

    if (!parsed.success) {
      return next(new AppError(422, 'VALIDATION_ERROR', 'Request validation failed', parsed.error.flatten()));
    }

    req[property] = parsed.data;
    return next();
  };
}

module.exports = {
  validate
};
