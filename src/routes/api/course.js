const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/api/course.controller');
router.get('/', courseController.getAll);
router.get('/:slug', courseController.getCourseDetail);
router.post('/', courseController.handleAddCourse);
router.post('/delete/many-course', courseController.handleDeleteManyCourse);
router.post('/:id', courseController.handleEditCourse);
router.delete('/:id', courseController.handleDeleteCourse);
module.exports = router;