const { v4: uuidv4 } = require("uuid");
const {
  Course,
  Discount,
  TypeCourse,
  Category,
  Lesson,
  Topic,
  LessonVideo,
  LessonQuiz,
  LessonDocument,
  Question,
  User,
  Answer,
  UsersCourses,
} = require("../../models/index");
module.exports = {
  registerFreeCourse: async (req, res) => {
    try {
      const { courseId, userId } = req.body;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Tìm khóa học
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ message: "không tồn tại khóa học trên" });
      }

      // Check nếu là khóa học mất phí thì không cho đăng ký
      if (course.price > 0) {
        return res.status(400).json({
          message: "Khóa học mất phí vui lòng thanh toán trước khi học",
        });
      }

      // Check nếu user đã đăng ký rồi
      const existing = await UsersCourses.findOne({
        where: { user_id: userId, course_id: courseId },
      });

      if (existing) {
        return res.status(200).json({ message: "Đã đăng kí khóa học" });
      }

      // Tạo bản ghi mới
      await UsersCourses.create({
        id: uuidv4(),
        user_id: userId,
        course_id: courseId,
        is_pay: false,
      });
      // Tăng lượt học
      if (course) {
        const currentAmount = course.amount_learn ?? 0; // Nếu null thì dùng 0
        await course.update({ amount_learn: currentAmount + 1 });
      }

      return res
        .status(201)
        .json({ message: "Course registered successfully" });
    } catch (error) {
      console.error("Register course error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getMyCourses: async (req, res) => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const myCourses = await UsersCourses.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Course,
            attributes: ["id", "title", "thumb", "price", "slug"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return res.status(200).json({ data: myCourses });
    } catch (error) {
      console.error("Get my courses error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
