const mongoose = require('mongoose');
const { formatDateTime } = require('../utils/formatDate');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    sort: { type: Number, default: 0 },
    status: { type: Number, enum: [0, 1], default: 1 }, // 0:禁用,1:启用
    description: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        if (ret.createdAt) ret.createdAt = formatDateTime(ret.createdAt);
        if (ret.updatedAt) ret.updatedAt = formatDateTime(ret.updatedAt);
        return ret; // 返回数据
      },
    },
  }
);

module.exports = mongoose.model('Category', categorySchema);
