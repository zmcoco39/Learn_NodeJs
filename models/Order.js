const mongoose = require('mongoose');
const { formatDateTime } = require('../utils/formatDate');

// 订单表结构
const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true }, // 订单号，如 "20260922xxxx"，创建时自动生成
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 下单用户，关联 User
    items: [
      {
        // 订单明细（一个订单多个商品）
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // 关联 Product
        name: { type: String, required: true }, // 下单时的商品快照名
        price: { type: Number, required: true, min: 0 }, // 下单时的商品快照价
        quantity: { type: Number, required: true, min: 1 }, // 数量
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 }, // 总金额 = 所有 item 的 price × quantity 之和
    status: { type: Number, enum: [0, 1, 2, 3], default: 1 }, // 0 已取消 / 1 待付款 / 2 已付款 / 3 已发货
    remark: { type: String, default: '' }, // 备注
  },
  {
    timestamps: true, // 自动生成 createdAt / updatedAt
    toJSON: {
      // 查询结果转 JSON 时，把时间格式化成 yyyy-MM-dd HH:mm:ss
      transform(doc, ret) {
        if (ret.createdAt) ret.createdAt = formatDateTime(ret.createdAt);
        if (ret.updatedAt) ret.updatedAt = formatDateTime(ret.updatedAt);
        return ret;
      },
    },
  }
);

// 保存前自动生成订单号：Date.now() + 3 位随机数，如 "1789561234567892"
orderSchema.pre('validate', function (next) {
  if (this.isNew && !this.orderNo) {
    this.orderNo = String(Date.now()) + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
