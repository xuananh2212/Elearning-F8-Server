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
  Sequelize,
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
  getDashboardChartData: async (req, res) => {
    try {
      const users_by_month = await User.findAll({
        attributes: [
          [
            Sequelize.fn(
              "TO_CHAR",
              Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("created_at")),
              "YYYY-MM"
            ),
            "month",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [
          Sequelize.literal(
            "TO_CHAR(DATE_TRUNC('month', \"created_at\"), 'YYYY-MM')"
          ),
        ],
        order: [[Sequelize.literal("month"), "ASC"]],
        raw: true,
      });

      const courses_by_category = await Course.findAll({
        attributes: [
          [Sequelize.literal('"Category"."name"'), "category"],
          [Sequelize.fn("COUNT", Sequelize.col("Course.id")), "count"],
        ],
        include: [
          {
            model: Category,
            attributes: [],
          },
        ],
        group: ["Category.name"],
        raw: true,
      });

      res.status(200).json({
        users_by_month,
        courses_by_category,
      });
    } catch (error) {
      console.error("Dashboard chart error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
