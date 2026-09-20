const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const { uploadFiles } = require("../middleware/uploadFilesMiddleware");
const {  SUCCESS } = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const Users = require("../models/user.model");
const factory = require("./factoryHandler");

// Upload image
exports.uploadUserImage = uploadFiles(["image"], "avatar");
// Image processing
exports.resizeImage = asyncWrapper(async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
  console.log(req.file);
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${fileName}`);
    // Save image into our DB
    req.body.avatar = fileName;
  }
  next();
});

exports.getAllUsers = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = +query.limit;
  const page = +query.page;
  const skip = (page - 1) * limit;

  const search = query.search;
  let filters = {};
  if (search) {
    filters.name = { $regex: search, $options: "i" };
  }

  const users = await Users.find(filters, { __v: false, password: false })
    .limit(limit)
    .skip(skip);
  res.status(201).json({ status: SUCCESS, data: { users } });
});

exports.getUser = factory.getOne(Users, "userId");
exports.addUser = factory.addOne(Users);
exports.deleteUser = factory.deleteOne(Users, "userId");
