const mongoose = require('mongoose');
const { formatDateTime } = require('../utils/formatDate');

// 用户表结构
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true }, // 用户名
    password: { type: String, required: true }, // 密码（学习项目暂不加密）
    nickname: { type: String, default: '' }, // 昵称
    role: { type: String, enum: ['admin', 'user'], default: 'user' }, // 角色
    status: { type: Number, enum: [0, 1], default: 1 }, // 状态：1 启用 / 0 禁用
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

module.exports = mongoose.model('User', userSchema);
