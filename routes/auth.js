const express = require('express');
const User = require('../models/User');
const { sign } = require('../utils/token');

const router = express.Router();

// POST /api/auth/login  登录：返回 token
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.fail('用户名和密码不能为空');

    const user = await User.findOne({ username }); // 登录必须查密码，不能用 select 排除
    if (!user || user.password !== password) return res.fail('用户名或密码错误', 401);
    if (user.status === 0) return res.fail('账号已被禁用', 403);

    const token = sign(user);
    res.success(
      {
        token,
        user: { _id: user._id, username: user.username, nickname: user.nickname, role: user.role },
      },
      '登录成功'
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  用 token 换取当前用户信息（验证 token 是否有效）
router.get('/me', require('../middleware/auth'), async (req, res, next) => {
  try {
    // req.user 是 auth 中间件解析 token 得到的 { _id, username, role }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.fail('用户不存在', 404);
    res.success(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
