var express = require("express");
var router = express.Router();
const authRouter = require('./api/auth');
const userRouter = require('./api/user');
const uploadRouter = require('./api/upload');
const courseRouter = require('./api/course');
const categoryRouter = require('./api/category');
router.use("/auth/v1", authRouter);
router.use("/user/v1", userRouter);
router.use("/upload/v1", uploadRouter);
router.use("/course/v1", courseRouter);
router.use("/category/v1", categoryRouter);
module.exports = router;