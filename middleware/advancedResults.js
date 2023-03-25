const asyncHandler = require("./async");

const advancedResults = (model, populate) =>
  asyncHandler(async (req, res, next) => {
    // Add $ to MongoDB query operators
    let { select, sort, page, limit, ...reqQuery } = req.query;

    const filterStr = JSON.stringify(reqQuery).replace(
      /\b(lt|lte|eq|gt|gte|in)\b/g,
      str => `$${str}`
    );

    const filter = JSON.parse(filterStr);

    if (req.params.bootcampId) {
      filter.bootcamp = req.params.bootcampId;
    }

    let query = model.find(filter);

    // .populate({ path: "courses or bootcamp", select: "title description" }) will return a specific fields of course document
    if (populate && !req.params.bootcampId) query = query.populate(populate);

    // Select certain fields
    if (select) {
      const selectedFields = select.replace(/,/g, " ");
      query = query.select(selectedFields);
    }

    // Sort results by certain fields
    if (sort) {
      const sortBy = sort.replace(/,/g, " ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Paginate the result
    page = parseInt(page <= 0 ? 1 : page, 10) || 1;
    limit = parseInt(limit, 10) || 25;
    const startIndex = (page - 1) * limit; // 0
    const endIndex = page * limit; // 10
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const results = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.advancedResults = {
      success: true,
      data: results,
      count: results.length,
      pagination,
      total,
    };

    next();
  });

module.exports = advancedResults;
