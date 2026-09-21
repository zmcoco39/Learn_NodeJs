const mongoose = require('mongoose');

// 商品表结构
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // 商品名称
    price: { type: Number, required: true, min: 0 }, // 价格
    stock: { type: Number, default: 0, min: 0 }, // 库存
    category: { type: String, default: '未分类' }, // 分类
    desc: { type: String, default: '' }, // 描述
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
