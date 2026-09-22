const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// POST /api/orders 下单，需要登录
// body: { items: [{ product, quantity }], remark }
// 商品名和价格以数据库里的为准，存成快照，防止商品改名改价后订单跟着变
router.post('/', auth, async (req, res, next) => {
  try {
    const { items, remark = '' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.fail('订单明细不能为空');
    }

    // 查出所有下单的商品，做成快照
    const products = await Product.find({ _id: { $in: items.map((i) => i.product) } });
    if (products.length === 0) return res.fail('商品不存在');

    const snapshots = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.product);
      if (!product) return res.fail(`商品不存在: ${item.product}`);

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.fail(`商品数量不合法: ${product.name}`);
      }
      if (product.stock < quantity) {
        return res.fail(`商品库存不足: ${product.name}`);
      }

      snapshots.push({
        product: product._id,
        name: product.name, // 快照名
        price: product.price, // 快照价
        quantity,
      });
      totalAmount += product.price * quantity;
    }

    const orderData = {
      user: req.user._id,
      items: snapshots,
      totalAmount,
      remark,
    };

    // 下单 + 扣库存：先扣库存（带 stock >= quantity 条件，防并发扣成负数），
    // 再创建订单；创建失败就把库存加回去（补偿模式）。
    // 本机 MongoDB 是 standalone 单机模式，不支持事务（需要副本集），所以用补偿写法；
    // 生产环境升级副本集后，可以改成 session 事务整体回滚。
    let order;
    try {
      for (const item of snapshots) {
        const result = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
        if (result.matchedCount === 0) {
          return res.fail(`商品库存不足: ${item.name}`);
        }
      }

      order = await Order.create(orderData);
    } catch (err) {
      // 订单创建失败，把已扣的库存加回去
      for (const item of snapshots) {
        await Product.updateOne(
          { _id: item.product, stock: { $gte: 0 } },
          { $inc: { stock: item.quantity } }
        );
      }
      throw err;
    }

    res.success(order, '下单成功');
  } catch (err) {
    next(err);
  }
});

// GET /api/orders?page=&size=&status= 分页查订单，需要登录
// admin 能看所有人的订单，普通用户只能看自己的
router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, size = 10, status = '' } = req.query;

    const filter = {};
    if (req.user.role !== 'admin') filter.user = req.user._id; // 非管理员只看自己的
    if (status !== '') filter.status = Number(status);

    const total = await Order.countDocuments(filter);
    const list = await Order.find(filter)
      .populate('user', 'username nickname') // 带出下单用户信息
      .populate('items.product', 'name price') // 带出商品当前信息（对比快照用）
      .skip((page - 1) * size)
      .limit(Number(size))
      .sort({ createdAt: -1 });

    res.success({ list, total, page: Number(page), size: Number(size) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status 修改订单状态，仅 admin
// body: { status: 2 } 0 已取消 / 1 待付款 / 2 已付款 / 3 已发货
router.put('/:id/status', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (![0, 1, 2, 3].includes(Number(status))) return res.fail('订单状态不合法');

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: Number(status) },
      { new: true, runValidators: true }
    );
    if (!order) return res.fail('订单不存在', 404);

    res.success(order, '修改成功');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id 取消订单，仅本人或 admin
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.fail('订单不存在', 404);

    // 不是本人也不是管理员，没权限删
    const isOwner = order.user.toString() === req.user._id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.fail('无权限执行此操作', 403);
    }

    // 取消订单：软删，把状态改成 0，订单记录保留
    order.status = 0;
    await order.save();

    res.success(null, '取消成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
