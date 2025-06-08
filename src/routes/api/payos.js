require("dotenv").config();
const express = require("express");
const router = express.Router();
const { PayOS } = require("@payos/node");
// Khởi tạo đối tượng PayOS với biến môi trường

router.post("/create", async (req, res) => {
  const payos = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
  );
  const { amount, userId, orderCode, description, returnUrl, cancelUrl } =
    req.body;

  try {
    const paymentLinkRes = await payos.createPaymentLink({
      orderCode: orderCode || Math.floor(Math.random() * 1000000), // tạo orderCode ngẫu nhiên nếu không truyền
      amount,
      description: description || "Thanh toán đơn hàng",
      returnUrl: returnUrl || "https://your-frontend.com/thank-you",
      cancelUrl: cancelUrl || "https://your-frontend.com/payment-failed",
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
  const data = req.body;
  // TODO: Xử lý cập nhật đơn hàng vào database

  res.status(200).json({ message: "Webhook received" });
});

module.exports = router;
