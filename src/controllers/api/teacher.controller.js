const { object, string } = require("yup");
const { User } = require("../../models");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../../utlis/sendEmail");

module.exports = {
  getAllTeachers: async (req, res) => {
    try {
      const teachers = await User.findAll({ where: { role: 1 } });
      const data = teachers.map((t) => {
        const { password, ...rest } = t.dataValues;
        return rest;
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teachers", error });
    }
  },

  // Tạo mới giáo viên
  createTeacher: async (req, res) => {
    try {
      const { name, email, password, address, phone, avatar } = req.body;

      // Check email tồn tại
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Tạo tài khoản giáo viên
      const teacher = await User.create({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        address,
        phone,
        avatar,
        role: 1,
      });

      // Gửi email thông báo tài khoản
      await sendEmail({
        to: email,
        subject: "Thông tin tài khoản giáo viên",
        html: `
        <p>Chào thầy/cô <strong>${name}</strong>,</p>
        <p>Hệ thống đã tạo tài khoản cho thầy/cô trên nền tảng E-Learning:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Mật khẩu:</strong> ${password}</li>
        </ul>
        <p>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi sử dụng lần đầu.</p>
        <br />
        <p>Trân trọng,<br />E-Learning Team</p>
      `,
      });

      const { password: pw, ...rest } = teacher.dataValues;
      res.status(201).json(rest);
    } catch (error) {
      console.error("error", error);
      res.status(500).json({ message: "Lỗi server khi tạo giáo viên", error });
    }
  },

  // Cập nhật thông tin giáo viên
  updateTeacher: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, address, phone, avatar } = req.body;

      const teacher = await User.findOne({ where: { id, role: 1 } });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      await teacher.update({ name, email, address, phone, avatar });

      const { password: pw, ...rest } = teacher.dataValues;
      res.status(200).json(rest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update teacher", error });
    }
  },

  // Xóa giáo viên
  deleteTeacher: async (req, res) => {
    try {
      const { id } = req.params;

      const teacher = await User.findOne({ where: { id, role: 1 } });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      await teacher.destroy();
      res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete teacher", error });
    }
  },
};
