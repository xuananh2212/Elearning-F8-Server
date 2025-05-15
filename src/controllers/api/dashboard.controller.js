const { v4: uuidv4 } = require("uuid");
const { object, string, boolean } = require("yup");
const {
  User,
  Course,
  Category,
  Lesson,
  Question,
  QuestionSet,
  LessonVideo,
  LessonDocument,
  Discount,
} = require("../../models/index");
module.exports = {
  getDashboardStats: async (req, res) => {
    try {
      const [
        total_users,
        total_courses,
        total_categories,
        total_lessons,
        total_questions,
        total_question_sets,
        total_videos,
        total_documents,
        total_discounts,
      ] = await Promise.all([
        User.count(),
        Course.count(),
        Category.count(),
        Lesson.count(),
        Question.count(),
        QuestionSet.count(),
        LessonVideo.count(),
        LessonDocument.count(),
        Discount.count(),
      ]);

      return res.status(200).json({
        total_users,
        total_courses,
        total_categories,
        total_lessons,
        total_questions,
        total_question_sets,
        total_videos,
        total_documents,
        total_discounts,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
