const jwt = require('jsonwebtoken');
const { SECRET } = require('../utils/token');

// 认证中间件：校验 token，把用户信息挂到 req.user 上
// 用法：router.delete('/:id', auth, requireRole('admin'), handler)
module.exports = function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');

  if (!token) return res.fail('未登录，请先登录', 401);

  try {
    // 校验并解析 token，里面的 _id、role 就能直接用了
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.fail('token 无效或已过期', 401);
  }
};
