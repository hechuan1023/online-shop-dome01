# BZShop 购物小程序

一个基于微信小程序 + Node.js/Express + MySQL 的电商商城系统，包含首页、分类、购物车、订单等完整购物流程。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序（原生 WXML/WXSS/JS） |
| 后端 | Node.js + Express 4.x |
| 数据库 | MySQL 8.x |
| 驱动 | mysql2 |

## 功能模块

- 首页：轮播图、分类导航、热门推荐、搜索
- 分类：左侧分类切换、右侧商品列表
- 商品详情：商品信息、加入购物车、立即购买
- 购物车：商品选择、数量调整、删除、全选、结算
- 搜索：关键词搜索、搜索历史
- 收货地址：增删改查、设置默认地址
- 订单：创建订单、订单列表、订单详情、取消/付款/确认收货

## 项目结构

```
shop-server/
├── index.js                # Express 服务入口（端口 3001）
├── router.js               # API 路由定义
├── SQLConnect.js           # MySQL 连接池配置
├── package.json
├── app.js                  # 小程序入口
├── app.json                # 小程序页面与 tabBar 配置
├── app.wxss                # 全局样式
├── images/                 # 小程序本地图片
│   ├── tab-*.png           # 底部导航栏图标（8 个）
│   └── default-avatar.png  # 默认用户头像
├── pages/                  # 小程序页面（13 个）
│   ├── index/              # 首页
│   ├── category/           # 分类
│   ├── cart/               # 购物车
│   ├── profile/            # 个人中心
│   ├── product-detail/     # 商品详情
│   ├── search/             # 搜索
│   ├── address/            # 收货地址
│   ├── address-edit/       # 编辑地址
│   ├── order-confirm/      # 订单确认
│   ├── order/              # 订单列表
│   ├── order-detail/       # 订单详情
│   └── pay-result/         # 支付结果
├── public/                 # 服务端静态资源
│   └── images/
│       ├── banner/         # 轮播图
│       ├── goods/          # 商品缩略图
│       ├── category/       # 分类图
│       └── details/        # 商品详情图
├── sql/
│   └── init.sql            # 数据库建表与初始数据
└── util/
    ├── config.js           # 小程序 appId/appSecret
    └── request.js          # wx.request 封装
```

## 快速启动

### 环境要求

- Node.js >= 16
- MySQL >= 8.0
- 微信开发者工具

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/shop-server.git
cd shop-server
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

#### 3.1 创建数据库

登录 MySQL，创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS bzshop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3.2 导入建表和初始数据

```bash
mysql -u root -p bzshop < sql/init.sql
```

这会创建以下 10 张表并插入初始数据：

| 表名 | 说明 | 初始数据 |
|------|------|----------|
| user | 用户表 | 无 |
| banner | 轮播图 | 4 条 |
| goods | 商品 | 8 条 |
| goodsdetails | 商品详情 | 8 条 |
| keywords | 搜索关键词 | 6 条 |
| cart | 购物车 | 无 |
| category | 商品分类映射 | 6 条 |
| orders | 订单主表 | 无 |
| order_items | 订单商品 | 无 |
| address | 收货地址 | 无 |

#### 3.3 导出数据（可选）

如果需要备份或迁移数据：

```bash
# 导出结构和数据
mysqldump -u root -p bzshop > bzshop_dump.sql

# 仅导出数据（不含建表语句）
mysqldump -u root -p --no-create-info bzshop > bzshop_data.sql
```

#### 3.4 修改数据库连接

编辑 `SQLConnect.js`，修改为你的 MySQL 配置：

```js
const MySQLObj = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",        // 改成你的用户名
    password: "123456",  // 改成你的密码
    database: "bzshop"
}
```

### 4. 启动后端服务

```bash
node index.js
# 服务器运行在 http://localhost:3001
```

### 5. 打开小程序

1. 打开微信开发者工具
2. 导入项目目录（选择 `shop-server` 文件夹）
3. 在 `util/config.js` 中配置你的小程序 appId 和 appSecret
4. 本地设置中勾选「不校验合法域名」
5. 编译运行

## API 接口

所有接口前缀为 `/api`。

### 商品相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/banner | 获取轮播图 |
| GET | /api/goods?page=N | 分页获取商品（每页 10 条） |
| GET | /api/goods/details?id=N | 商品详情 |
| GET | /api/goods/search?search=... | 模糊搜索商品 |
| GET | /api/keywords | 搜索关键词 |
| GET | /api/category?tag=... | 按分类获取商品 |

### 购物车

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/cart/add | 加入购物车 |
| GET | /api/cart | 购物车列表 |
| GET | /api/cart/del?currentID=N | 删除购物车商品 |

### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 微信登录（code 换 openid） |

### 收货地址

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/address/list | 地址列表 |
| POST | /api/address/add | 新增地址 |
| POST | /api/address/update | 更新地址 |
| POST | /api/address/delete | 删除地址 |
| POST | /api/address/default | 设置默认地址 |

### 订单

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/order/create | 创建订单 |
| GET | /api/order/list?status= | 订单列表（可按状态筛选） |
| GET | /api/order/detail?order_no= | 订单详情 |
| POST | /api/order/cancel | 取消订单 |
| POST | /api/order/confirm | 确认收货 |
| POST | /api/pay/create | 模拟支付（开发环境） |

## 数据库设计

### user 用户表

```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100),
  session_key VARCHAR(100),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### banner 轮播图表

```sql
CREATE TABLE banner (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image VARCHAR(500),       -- 图片路径
  link VARCHAR(500),        -- 跳转链接
  sort_order INT DEFAULT 0, -- 排序
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### goods 商品表

```sql
CREATE TABLE goods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),          -- 商品名称
  price DECIMAL(10,2),         -- 价格
  image VARCHAR(500),          -- 商品主图路径
  description TEXT,            -- 商品描述
  stock INT DEFAULT 100,       -- 库存
  sales INT DEFAULT 0,         -- 销量
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### goodsdetails 商品详情表

结构同 goods 表，用于商品详情页展示。

### keywords 搜索关键词表

```sql
CREATE TABLE keywords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(100),
  sort_order INT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### cart 购物车表

```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  image VARCHAR(500),
  price DECIMAL(10,2),
  currentID INT,               -- 关联商品 ID
  quantity INT DEFAULT 1,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### category 商品分类表

```sql
CREATE TABLE category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cate VARCHAR(100),           -- 分类标签（phone/computer/earphone 等）
  goods_id INT,                -- 关联商品 ID
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### orders 订单主表

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) UNIQUE NOT NULL,  -- 订单号
  user_id INT,
  address_id INT,                        -- 收货地址 ID
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  pay_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  freight DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 0,     -- 0待付款 1待发货 2待收货 3已完成 4已取消
  remark VARCHAR(255),
  pay_time DATETIME,
  deliver_time DATETIME,
  receive_time DATETIME,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### order_items 订单商品表

```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  goods_id INT NOT NULL,
  title VARCHAR(255),
  image VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### address 收货地址表

```sql
CREATE TABLE address (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  province VARCHAR(50),
  city VARCHAR(50),
  district VARCHAR(50),
  detail VARCHAR(255) NOT NULL,
  is_default TINYINT NOT NULL DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 图片资源说明

### 本地图片（images/ 目录）

打包进小程序，用于静态 UI 资源。

| 文件 | 用途 | 尺寸 |
|------|------|------|
| `tab-home.png` | 首页图标（未选中） | 81x81 px |
| `tab-home-active.png` | 首页图标（选中） | 81x81 px |
| `tab-category.png` | 分类图标（未选中） | 81x81 px |
| `tab-category-active.png` | 分类图标（选中） | 81x81 px |
| `tab-cart.png` | 购物车图标（未选中） | 81x81 px |
| `tab-cart-active.png` | 购物车图标（选中） | 81x81 px |
| `tab-profile.png` | 我的图标（未选中） | 81x81 px |
| `tab-profile-active.png` | 我的图标（选中） | 81x81 px |
| `default-avatar.png` | 默认用户头像 | 128x128 px |

### 服务器图片（public/images/ 目录）

通过 Express 静态服务提供访问，数据库中存储相对路径。

| 目录 | 用途 | 建议尺寸 | 数量 |
|------|------|----------|------|
| `banner/` | 首页轮播图 | 750x300 px | 4 张 |
| `goods/` | 商品缩略图 | 750x750 px | 14 张 |
| `details/` | 商品详情图 | 750x 自适应 | 28 张 |
| `category/` | 分类促销图（备用） | 750x300 px | 8 张 |

## 常见问题

### 图片不显示

确保数据库中的图片路径与 `public/images/` 下的文件对应。路径格式为 `/images/goods/1.webp`（不含 `http://localhost:3001` 前缀）。

### 数据库连接失败

检查 `SQLConnect.js` 中的 host、port、user、password 是否与你的 MySQL 配置一致。

### 小程序请求报错

在微信开发者工具中：详情 → 本地设置 → 勾选「不校验合法域名」。

### 如何添加新商品

1. 将商品图片放入 `public/images/goods/` 目录
2. 向 `goods` 表插入记录：

```sql
INSERT INTO goods (title, price, image, description, stock)
VALUES ('商品名称', 99.00, '/images/goods/新图片.webp', '商品描述', 100);
```

3. 同步插入 `goodsdetails` 表（商品详情页使用）

## License

MIT

111