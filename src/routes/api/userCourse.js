var express = require("express");
var router = express.Router();
var userCourseController = require("../../controllers/api/userCourse.controller");
router.post("/register-free-course", userCourseController.registerFreeCourse);
router.get("/get-my-course", userCourseController.getMyCourses);
module.exports = router;
