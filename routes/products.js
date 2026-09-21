const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products?keyword=xx&category=xx&page=1&size=10
router.get('/', async (req, res, next) => {
  try {
    const { keyword = '', category = '', page = 1, size = 10 } = req.query;

    // 组装查询条件
    const filter = {};
    if (keyword) filter.name = new RegExp(keyword, 'i');
    if (category) filter.category = category;

    const total = await Product.countDocuments(filter);
    const list = await Product.find(filter)
      .skip((page - 1) * size)
      .limit(Number(size))
      .sort({ createdAt: -1 });

    res.success({ list, total, page: Number(page), size: Number(size) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.fail('商品不存在', 404);
    res.success(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) return res.fail('商品名称和价格不能为空');

    const product = await Product.create(req.body);
    res.success(product, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.fail('商品不存在', 404);
    res.success(product, '更新成功');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.fail('商品不存在', 404);
    res.success(null, '删除成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
