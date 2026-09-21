# 后台管理系统（Node.js 学习项目）

一个用于学习 Node.js 的后台管理系统 API，技术栈：**Express + Mongoose + MongoDB**。

包含两个典型的 CRUD 模块：**用户管理** 和 **商品管理**，涵盖后台开发最常见的场景：分页查询、模糊搜索、新增、修改、删除、统一响应格式、全局错误处理。

## 项目结构

```
learn_nodejs/
├── app.js                  # 入口：中间件、路由注册、错误处理、启动服务
├── config/
│   └── db.js               # MongoDB 连接配置
├── models/
│   ├── User.js             # 用户表结构（Schema）
│   └── Product.js          # 商品表结构（Schema）
├── routes/
│   ├── users.js            # 用户模块增删改查接口
│   └── products.js         # 商品模块增删改查接口
└── middleware/
    └── response.js         # 统一响应格式中间件
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动服务（默认连接 mongodb://localhost:27017/admin_system）
npm start

# 开发模式：文件改动后自动重启
npm run dev
```

服务启动后访问 http://localhost:3000

## API 接口

所有接口的响应格式统一为：

```json
{ "code": 0, "message": "操作成功", "data": {} }
```

### 用户管理 /api/users

| 方法   | 路径            | 说明                                           |
| ------ | --------------- | ---------------------------------------------- |
| GET    | /api/users      | 分页查询，支持 `?keyword=xx&page=1&size=10`    |
| GET    | /api/users/:id  | 查询单个用户                                   |
| POST   | /api/users      | 新增用户，body: `{ "username": "admin", "password": "123456" }` |
| PUT    | /api/users/:id  | 修改用户                                       |
| DELETE | /api/users/:id  | 删除用户                                       |

### 商品管理 /api/products

| 方法   | 路径               | 说明                                                        |
| ------ | ------------------ | ----------------------------------------------------------- |
| GET    | /api/products      | 分页查询，支持 `?keyword=xx&category=手机&page=1&size=10`   |
| GET    | /api/products/:id  | 查询单个商品                                                |
| POST   | /api/products      | 新增商品，body: `{ "name": "手机", "price": 4999 }`         |
| PUT    | /api/products/:id  | 修改商品                                                    |
| DELETE | /api/products/:id  | 删除商品                                                    |

## 接口测试示例（curl）

```bash
# 新增商品
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "iPhone 15", "price": 5999, "stock": 100, "category": "手机"}'

# 查询商品列表
curl "http://localhost:3000/api/products?keyword=iPhone&page=1&size=10"

# 修改商品（把 :id 换成上面返回的 _id）
curl -X PUT http://localhost:3000/api/products/:id \
  -H "Content-Type: application/json" \
  -d '{"price": 5499}'

# 删除商品
curl -X DELETE http://localhost:3000/api/products/:id
```

也可以用 Apifox / Postman 调试。

## 学习建议

1. 先看 `app.js`，理解请求进来之后经过哪些中间件、怎么匹配到路由
2. 再看 `routes/users.js`，这是最标准的增删改查写法
3. `models/User.js` 里的 Schema 定义了数据有哪些字段、什么规则
4. 尝试自己加一个「分类管理」模块练手（参考 products 路由）
