const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// 查询接口
router.get("/", async (req, res, next) => {
  try {
    const { name, page = 1, size = 10 } = req.query;
    // 组装查询条件
    const filter = {};
    if (name) filter.name = new RegExp(name, "i");
    const total = await Category.countDocuments(filter);
    const list = await Category.find(filter)
      .skip((page - 1) * size)
      .limit(size);
    res.success({ total, list, page: Number(page), size: Number(size) });
  } catch (err) {
    next(err);
  }
});

// 新增接口
router.post("/", async (req, res, next) => {
  try {
    const { name, sort = 0, status = 1, description = "" } = req.body;
    if (!name) return res.fail("分类名称不能为空");
    const exists = await Category.findOne({ name });
    if (exists) return res.fail("分类名称已存在");
    const category = await Category.create({ name, sort, status, description });
    res.success(category, "创建成功");
  } catch (err) {
    next(err);
  }
});

// 修改接口
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sort, status, description } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.fail("分类不存在", 404);
    if (name && name !== category.name) {
      const exists = await Category.findOne({ name });
      if (exists) return res.fail("分类名称已存在");
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, sort, status, description },
      { new: true },
    );
    res.success(updatedCategory, "更新成功");
  } catch (err) {
    next(err);
  }
});

// 删除接口
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.fail("分类不存在", 404);
    await Category.findByIdAndDelete(id);
    res.success(null, "删除成功");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
