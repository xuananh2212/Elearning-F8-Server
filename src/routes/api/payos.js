require("dotenv").config();
const express = require("express");
const router = express.Router();
const PayOS = require("@payos/node");
const { UsersCourses } = require("../../models");
const { v4: uuidv4 } = require("uuid");
// Khởi tạo đối tượng PayOS với biến môi trường
if (
  !process.env.PAYOS_CLIENT_ID ||
  !process.env.PAYOS_API_KEY ||
  !process.env.PAYOS_CHECKSUM_KEY
) {
  console.error(
    "Thiếu PAYOS_CLIENT_ID, PAYOS_API_KEY hoặc PAYOS_CHECKSUM_KEY trong file .env"
  );
  process.exit(1);
}

// Tạo instance PayOS một lần (có thể reuse)
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);
const API =
  "https://374c-2405-4802-4d1-7950-b434-64b4-bc30-f1f9.ngrok-free.app";

router.post("/create", async (req, res) => {
  const {
    amount,
    userId,
    courseId,
    orderCode,
    description,
    returnUrl,
    cancelUrl,
  } = req.body;
  console.log("userId", userId);
  console.log("courseId", courseId);
  try {
    // 1. Xác định mã đơn hàng (orderCode)
    const generatedOrderCode = orderCode || Math.floor(Math.random() * 9000000);

    // 2. Kiểm tra xem orderCode đã tồn tại trong DB chưa
    const existing = await UsersCourses.findOne({
      where: {
        order_code: generatedOrderCode.toString(),
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "orderCode đã tồn tại. Không thể tạo lại đơn hàng.",
      });
    }

    // 3. Tạo payment link
    const paymentLinkRes = await payos.createPaymentLink({
      orderCode: generatedOrderCode,
      amount,
      description: description?.slice(0, 25) || "Thanh toan khoa hoc",
      returnUrl: returnUrl || "",
      cancelUrl: cancelUrl || "",
    });

    // 4. Lưu thông tin vào DB
    await UsersCourses.create({
      id: uuidv4(),
      user_id: userId,
      course_id: courseId,
      is_pay: false, // chưa thanh toán
      order_code: generatedOrderCode.toString(),
      payment_status: 1, // 1 = chờ thanh toán
    });

    res.status(200).json({
      success: true,
      checkoutUrl: paymentLinkRes.checkoutUrl,
    });
  } catch (error) {
    console.error("Tạo thanh toán thất bại:", error);
    res.status(500).json({ success: false, message: "Lỗi tạo đơn thanh toán" });
  }
});
router.post("/webhook", async (req, res) => {
  const payload = req.body;
  try {
    // Kiểm tra webhook thành công theo success = true và code = '00'
    if (payload?.success === true && payload?.code === "00") {
      // Lấy orderCode từ payload.data
      const orderCode = payload?.data?.orderCode?.toString();

      if (!orderCode) {
        console.error("Webhook không có orderCode");
        return res
          .status(400)
          .json({ message: "Thiếu orderCode trong webhook" });
      }

      // Tìm bản ghi UsersCourses theo order_code
      const existing = await UsersCourses.findOne({
        where: { order_code: orderCode },
      });

      if (existing) {
        // Cập nhật trạng thái thanh toán thành công
        await UsersCourses.update(
          { is_pay: true, payment_status: 2 }, // 2 = đã thanh toán thành công
          { where: { order_code: orderCode } }
        );
      } else {
        // Nếu chưa có bản ghi (thường không xảy ra nếu quy trình tạo đơn đúng)
        console.warn(`Không tìm thấy đơn hàng với order_code: ${orderCode}`);
        // Có thể tạo mới hoặc trả lỗi tùy nghiệp vụ
      }
    }

    res.status(200).json({ message: "Xử lý webhook thành công" });
  } catch (error) {
    console.error("Lỗi xử lý webhook:", error);
    res.status(500).json({ message: "Lỗi server khi xử lý webhook" });
  }
});
module.exports = router;
