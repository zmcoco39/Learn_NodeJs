// 角色权限中间件：配合 auth 使用，限制只有指定角色能访问
// 用法：router.delete('/:id', auth, requireRole('admin'), handler)
module.exports = function requireRole(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.fail('无权限执行此操作', 403);
    }
    next();
  };
};
