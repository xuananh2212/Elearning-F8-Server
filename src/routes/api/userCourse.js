var express = require("express");
var router = express.Router();
var userCourseController = require("../../controllers/api/userCourse.controller");
router.post("/register-free-course", userCourseController.registerFreeCourse);
router.get("/get-my-course", userCourseController.getMyCourses);
router.get("/get-all-users-course", userCourseController.getAllUsersCourses);
module.exports = router;
