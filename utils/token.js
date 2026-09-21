const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'learn_nodejs_secret'; // 学习项目用固定密钥，生产环境应放环境变量
const EXPIRES = '8h'; // token 有效期

// 生成 token：登录成功后调用，把用户 id 和角色写进去
function sign(user) {
  return jwt.sign({ _id: user._id, username: user.username, role: user.role }, SECRET, {
    expiresIn: EXPIRES,
  });
}

module.exports = { sign, SECRET };
