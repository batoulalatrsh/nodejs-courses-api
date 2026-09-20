require("dotenv").config();
var cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");
const { rateLimit } = require("express-rate-limit");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const { ERROR } = require("./utils/httpStatusText");
const mongoose = require("mongoose");

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("Connected to MongoDB");
});

//MIDDLEWARE for using body request
app.use(express.json({ limit: "30kb" }));

// Activate CORS before any route
app.use(cors());

// Route limiter for protecting from brute forcing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply the rate limiting middleware to all requests.
app.use("/api/auth/forgotPassword", limiter);

const courseRouter = require("./routes/courses.routes");
// We use router here as a middleware, any request on '/' slash enter it to router
app.use("/api/courses", courseRouter);

const usersRouter = require("./routes/users.routes");
app.use("/api/users", usersRouter);

const authRouter = require("./routes/auth.routes");
app.use("/api/auth", authRouter);

const enrollmentsRouter = require("./routes/enrollments.routes");
app.use("/api/enrollments", enrollmentsRouter);

// if we have path don't exist in courses routers
app.all("/*splat", (req, res, next) => {
  res
    .status(404)
    .json({ status: ERROR, code: 404, data: null, message: "Path Not Found!" });
});

// Global "error middleware" for handing errors
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: error.statusText || ERROR,
    data: null,
    message: error.message || "Invalid Object ID",
    code: statusCode,
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Listening on port 5000");
});
