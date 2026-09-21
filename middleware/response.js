// 统一响应格式：给 res 对象挂上 success / fail 两个快捷方法
// 用法：res.success(data) / res.fail('错误信息', 400)

module.exports = function responseFormatter(req, res, next) {
  // 成功响应：res.success(data) 或 res.success(data, '提示文字')
  res.success = function (data = null, message = '操作成功') {
    this.json({ code: 0, message, data });
  };

  // 失败响应：res.fail('错误信息', 400)
  res.fail = function (message = '操作失败', status = 400) {
    this.status(status).json({ code: status, message, data: null });
  };

  next();
};
