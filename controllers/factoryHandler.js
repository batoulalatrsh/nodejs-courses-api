const {  SUCCESS, FAIL } = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");

exports.addOne = (Model) =>
  asyncWrapper(async (req, res, next) => {
    const document = await Model.create(req.body);
    if (!document) {
      return next(new AppError().create("Something went wron!", 500, FAIL));
    }
    await res.status(201).json({ status: SUCCESS, data: { document } });
  });

exports.getOne = (Model, paramName, option = {}, populateOpt) =>
  asyncWrapper(async (req, res, next) => {
    // 1) Build query
    const query = Model.findById(req.params[paramName], option);
    if (populateOpt) {
      query.populate(populateOpt);
    }
    
    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new AppError().create("Document Not Found!", 404, FAIL));
    }
    res.status(200).json({ status: SUCCESS, data: { document } });
  });

exports.deleteOne = (Model, paramName) =>
  asyncWrapper(async (req, res, next) => {
    const document = await Model.deleteOne({ _id: req.params[paramName] });

    if (!document) {
      return next(new AppError().create("Document Not Found!", 404, FAIL));
    }
    res.status(200).json({ status: SUCCESS });
  });

exports.updateOne = (Model, paramName) =>
  asyncWrapper(async (req, res, next) => {
    const document = await Model.findById(req.params[paramName]);

    if (!document) {
      return next(new AppError().create("Document Not Found!", 404));
    }

    const updatedDocument = await Model.findByIdAndUpdate(
      req.params[paramName],
      req.body,
      { new: true },
    );

    res.status(200).json({ status: SUCCESS, data: { updatedDocument } });
  });
