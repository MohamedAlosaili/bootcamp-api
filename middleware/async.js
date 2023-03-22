const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Explanation of the way the above handler works
// const asyncHandler = fn => async (req, res, next) => {
//   try {
//     return await fn(req, res, next);
//   } catch (error) {
//     return next(error);
//   }
// };

module.exports = asyncHandler;
