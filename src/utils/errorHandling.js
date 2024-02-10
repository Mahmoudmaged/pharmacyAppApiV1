export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      return next(err);
    });
  };
};

export const globalErrorHandling = (err, req, res, next) => {
  if (err) {
    if (process.env.MOOD == "DEV") {
      return res
        .status(err.cause?.code || 500)
        .json({ errorMessage: err.message, customCode: err.cause?.customCode, err, stack: err.stack });
    } else {

      return res
        .status(err.cause?.code || 500)
        .json({ errorMessage: err.message, customCode: err.cause?.customCode });
    }
  }
};
