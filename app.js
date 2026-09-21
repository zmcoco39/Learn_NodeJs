const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

// ---------- 通用中间件 ----------
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体
app.use(require('./middleware/response')); // 挂载统一响应格式

// ---------- 路由 ----------
app.get('/', (req, res) => {
  res.json({ code: 0, message: '后台管理系统 API 运行中 🚀' });
});
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));

// ---------- 全局错误处理 ----------
// 路由里 next(err) 的错误都会到这里，统一返回 500
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.message);
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

// ---------- 启动服务 ----------
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 服务已启动: http://localhost:${PORT}`);
  });
});
