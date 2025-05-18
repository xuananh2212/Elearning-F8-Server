var express = require("express");
var router = express.Router();
const teacherController = require("../../controllers/api/teacher.controller");
router.get("/", teacherController.getAllTeachers);
router.post("/create", teacherController.createTeacher);
router.post("/:id", teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);
module.exports = router;
