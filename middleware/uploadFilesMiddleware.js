const multer = require("multer");
const AppError = require("../utils/appError");

exports.uploadFiles = (filters, filename) => {
  const storage = multer.memoryStorage();

  // Check if content is (iamge, video, file)
  const fileFilter = (req, file, cb) => {
    const fileType = file.mimetype.split("/")[0];


    if (Object.values(filters).includes(fileType)) {
      return cb(null, true);
    }

    return cb(
      new AppError().create(
        `File must be one of: ${Object.values(filters).join(", ")}`,
        400,
      ),
      false,
    );
  };

  return multer({ storage: storage, fileFilter: fileFilter }).single(filename);
};
