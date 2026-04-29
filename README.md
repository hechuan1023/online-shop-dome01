# BZShop 微信小程序商城

基于**微信小程序原生框架 + Node.js/Express + MySQL**的全栈电商平台，涵盖商品浏览、搜索、购物车、下单、收藏、管理后台等完整购物链路。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生（WXML/WXSS/JS） | 4 个 Tab 页面 + 14 个子页面 |
| 后端 | Node.js + Express 4.x | RESTful API，20+ 接口 |
| 数据库 | MySQL 8.0 + InnoDB | 12 张业务表，utf8mb4 |
| 驱动 | mysql2 | 连接池，参数化查询 |
| 上传 | Multer | 多文件上传，格式/大小校验 |
| 部署 | Nginx + PM2 | 反向代理、SSL 终端、进程守护 |
| 运维 | Python + Paramiko | SSH/SFTP 自动化部署 |

## 功能模块

### 用户端

| 模块 | 功能 |
|------|------|
| 首页 | Banner 轮播图、8 大分类导航、热门关键词、热门推荐瀑布流、返回顶部 |
| 分类 | 左侧分类栏 + 右侧商品列表，联表查询 |
| 搜索 | 关键词搜索、搜索历史（本地存储）、热门搜索词 |
| 商品详情 | 轮播图、图文详情（文字+图片混排）、购物车角标、收藏切换 |
| 购物车 | 单选/全选、数量加减、删除、底部结算栏、空态引导 |
| 订单 | 订单确认、订单列表（按状态筛选）、订单详情 |
| 收藏 | 添加/取消收藏、收藏列表（联表查询商品信息） |
| 收货地址 | 增删改查、设置默认地址 |
| 个人中心 | 登录态管理、订单/收藏统计、各功能入口 |
| 微信登录 | wx.login → code 换 openid + token |

### 管理后台

| 模块 | 功能 |
|------|------|
| 商品管理 | 商品列表（分页）、新增/编辑/删除商品 |
| 商品编辑 | 主图上传、轮播图多图上传（最多 9 张）、图文详情编辑器（文字+图片自由排序） |
| 图片上传 | wx.uploadFile 直传 → Multer 接收 → 返回 HTTPS URL |

## 项目结构

```
shop-server/
├── app.js                  # 小程序入口：globalData、登录态管理
├── app.json                # 页面注册、TabBar 配置
├── app.wxss                # 全局样式
├── index.js                # Express 服务入口（端口 3001）
├── router.js               # API 路由（20+ 接口）
├── SQLConnect.js           # MySQL 连接池（mysql2）
├── package.json
├── project.config.json     # 微信开发者工具配置
│
├── pages/                  # 小程序页面
│   ├── index/              # 首页（Tab 1）
│   ├── category/           # 分类（Tab 2）
│   ├── cart/               # 购物车（Tab 3）
│   ├── profile/            # 个人中心（Tab 4）
│   ├── product-detail/     # 商品详情
│   ├── products/           # 商品列表
│   ├── search/             # 搜索
│   ├── login/              # 微信登录
│   ├── favorites/          # 我的收藏
│   ├── address/            # 收货地址列表
│   ├── address-edit/       # 地址编辑
│   ├── order-confirm/      # 订单确认
│   ├── order/              # 订单列表
│   ├── order-detail/       # 订单详情
│   ├── pay-result/         # 支付结果
│   ├── customer-service/   # 客服
│   ├── admin-goods/        # 后台商品管理
│   └── admin-goods-edit/   # 后台商品编辑
│
├── components/             # 公共组件
├── images/                 # 小程序本地图片（TabBar 图标等）
├── util/                   # 工具模块
│   ├── request.js          # 网络请求封装（Promise + Token 注入）
│   ├── pagination-loader.js # 分页加载
│   ├── image-lazy-loader.js # 图片懒加载
│   └── config.js           # 小程序配置（appId/appSecret）
│
├── public/images/          # 服务器静态资源（Nginx 直接 serve）
│   ├── banner/             # 首页轮播图
│   ├── goods/              # 商品主图 + 轮播图
│   └── details/            # 商品图文详情配图
│
└── sql/                    # 数据库脚本
    ├── init.sql            # 建表语句（12 张表）
    └── insert_goods.sql    # 初始商品数据
```

## 快速启动

### 环境要求

- Node.js >= 16
- MySQL >= 8.0
- 微信开发者工具（稳定版）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS shop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"

# 导入建表 + 初始数据
mysql -u root -p shop < sql/init.sql
mysql -u root -p shop < sql/insert_goods.sql
```

### 3. 修改数据库连接

编辑 `SQLConnect.js`：

```js
const MySQLObj = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "你的密码",
    database: "shop"
}
```

### 4. 启动后端

```bash
node index.js
# 服务运行在 http://localhost:3001
```

### 5. 打开小程序

1. 微信开发者工具 → 导入项目（选择项目根目录）
2. 详情 → 本地设置 → 勾选「不校验合法域名」
3. 编译运行

## API 接口

所有接口前缀为 `/api`。

### 首页

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/banner | 获取轮播图列表 |
| GET | /api/keywords | 获取热门搜索词 |
| GET | /api/goods?page=&pageSize= | 分页获取商品列表 |

### 分类 & 搜索

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/category?tag= | 按分类标签查询商品（联表 category + goods） |
| GET | /api/goods/search?search= | 模糊搜索（匹配标题 + 分类） |

### 商品详情

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/goods/images?goods_id= | 获取商品轮播图 |
| GET | /api/goods/detail-content?goods_id= | 获取商品图文详情 |

### 购物车

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/cart | 购物车列表（联表 goods） |
| POST | /api/cart/add | 加入购物车（已存在则增加数量） |
| POST | /api/cart/update | 修改商品数量 |
| POST | /api/cart/remove | 删除购物车商品 |

### 订单

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | /api/order/add | 创建订单 |
| GET | /api/order/list?status= | 订单列表（按状态筛选：0待付款/1待发货/2待收货/3待评价） |
| GET | /api/order/detail?id= | 订单详情 |

### 收藏

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/favorite/list | 收藏列表（联表 goods） |
| GET | /api/favorite/check?goods_id= | 检查是否已收藏 |
| POST | /api/favorite/add | 添加收藏 |
| POST | /api/favorite/remove | 取消收藏 |

### 收货地址

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/address/list | 地址列表 |
| POST | /api/address/add | 新增地址 |
| POST | /api/address/update | 修改地址 |
| POST | /api/address/delete | 删除地址 |

### 登录

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | /api/login | 微信登录（code → openid + token） |

### 管理后台

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/admin/goods/list | 后台商品列表（分页） |
| POST | /api/admin/goods/add | 添加商品（含多图 + 图文详情） |
| POST | /api/admin/goods/update | 修改商品 |
| POST | /api/admin/goods/upload | 图片上传（Multer） |

## 数据库设计

共 12 张表，引擎 InnoDB，字符集 utf8mb4。

| 表名 | 说明 | 核心字段 |
|------|------|------|
| goods | 商品主表 | id, title, price, image, description, stock |
| goods_images | 商品轮播图 | id, goods_id(FK), image, sort_order |
| goods_detail_content | 商品图文详情 | id, goods_id(FK), type(text/image), value, sort_order |
| category | 商品分类关联 | id, goods_id(FK), cate |
| banner | 首页轮播图 | id, image, goods_id, sort_order |
| keywords | 热门搜索词 | id, keyword |
| cart | 购物车 | id, goods_id(FK), quantity |
| orders | 订单主表 | id, order_no, user_id, address_id, total_amount, pay_amount, freight, status |
| order_items | 订单商品明细 | id, order_id(FK), goods_id, title, price, image, quantity |
| favorites | 商品收藏 | id, goods_id(FK, UNIQUE), create_time |
| address | 收货地址 | id, name, phone, province, city, district, detail, is_default |
| user | 用户信息 | id, openid, nickname, avatar |

### 表关系

```
goods 1 ── N goods_images          （轮播图）
goods 1 ── N goods_detail_content  （图文详情）
goods 1 ── 1 category              （分类）
goods 1 ── N cart                  （购物车）
goods 1 ── N favorites             （收藏）
goods 1 ── N order_items           （订单明细）
orders 1 ── N order_items          （一个订单多个商品）
```

所有外键配置 `ON DELETE CASCADE` 级联删除。

## 部署架构

```
微信小程序 ── HTTPS ──▶ Nginx (80/443)
                           │
                    SSL 终端 + 反向代理
                           │
                    proxy_pass http://127.0.0.1:3001
                           │
                    Express API Server (PM2 守护)
                           │
                    mysql2 连接池
                           │
                    MySQL 8.0 (127.0.0.1:3306)
```

- **服务器**：阿里云 Linux (OpenAnolis)
- **Nginx**：SSL 证书 + 反向代理 + 静态资源 serve（`client_max_body_size 20m`）
- **PM2**：进程守护、自动重启、日志管理
- **部署方式**：Python + Paramiko SSH/SFTP 一键部署

## 技术亮点

1. **Tab 页面跨页传参** — `wx.switchTab` 不支持 URL 参数，通过 `app.globalData` 中转（分类标签、搜索关键词），目标页在 `onShow` 中消费
2. **图片上传全链路** — `wx.uploadFile` 直传 → Multer 接收 → 存盘 → 返回 HTTPS URL，避开 base64 编码膨胀
3. **HTTP → HTTPS 升级** — 自签 SSL → Nginx 443 → 数据库批量替换旧 URL → 前端全局切换
4. **图文详情编辑器** — 文字段落 + 图片自由排列，支持上移/下移/删除，仿京东商品详情样式
5. **请求统一封装** — `request.js` 处理 URL 拼接、Token 注入、Loading 状态、Promise 化
6. **联表查询优化** — 分类、购物车、收藏均联表查询 goods，一次请求获取完整数据，减少网络往返
