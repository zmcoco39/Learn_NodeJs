const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learn_nodejs';

// 连接 MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB 连接成功');
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err.message);
    process.exit(1); // 连不上数据库就直接退出，避免服务带病运行
  }
}

module.exports = { connectDB };
