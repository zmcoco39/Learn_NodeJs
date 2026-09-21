const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users?keyword=xx&page=1&size=10  分页 + 关键字查询
router.get('/', async (req, res, next) => {
  try {
    const { keyword = '', page = 1, size = 10 } = req.query;
    const filter = keyword
      ? { username: new RegExp(keyword, 'i') } // 按用户名模糊搜索
      : {};

    // const total = await User.countDocuments(filter);
    const total = await User.countDocuments(filter);
    const list = await User.find(filter)
      .select('-password') // 不返回密码字段
      .skip((page - 1) * size)
      .limit(Number(size))
      .sort({ createdAt: -1 });

    res.success({ list, total, page: Number(page), size: Number(size) });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id  查询单个
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.fail('用户不存在', 404);
    res.success(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/users  新增
router.post('/', async (req, res, next) => {
  try {
    const { username, password, nickname, role } = req.body;
    if (!username || !password) return res.fail('用户名和密码不能为空');

    const exists = await User.findOne({ username });
    if (exists) return res.fail('用户名已存在');

    const user = await User.create({ username, password, nickname, role });
    res.success({ _id: user._id }, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id  修改
router.put('/:id', async (req, res, next) => {
  try {
    const { nickname, role, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nickname, role, status },
      { new: true, runValidators: true } // new: 返回更新后的数据
    ).select('-password');

    if (!user) return res.fail('用户不存在', 404);
    res.success(user, '更新成功');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id  删除
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.fail('用户不存在', 404);
    res.success(null, '删除成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
