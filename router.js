const express = require("express");
const router = express.Router();
const SQLConnect = require("./SQLConnect.js");
const url = require("url");
const request = require("request");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 确保上传目录存在
const uploadDir = path.join(__dirname, "public", "images", "goods");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 配置
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, "goods-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6) + ext);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("仅支持 jpg/png/gif/webp 格式"));
        }
    }
});
// const authorization_code = "itbaizhan"

// const appid = "wxe4135ba344b525f4"
// const secret = "a3e4a228cf68dbd055f63487352b582b"
//qsls测试号
const authorization_code = "authorization_code"
const appid = "wx510280a0ce5eaad5"
const secret = "cc6c2a3f92b3538aef9d84e836828bde"



/**
 * banner接口地址
 */
router.get("/banner", (req, res) => {
    const sql = "select * from banner";
    SQLConnect(sql, [], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: {
                    result: result
                }
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }

    })
})

/**
 * 推荐商品
 */
router.get("/goods", (req, res) => {
    var page = url.parse(req.url, true).query.page || 1;
    const sql = "select * from goods limit 10 offset " + (page - 1) * 10;
    SQLConnect(sql, [page], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: {
                    result: result
                }
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }

    })
})

/**
 * 搜索，模糊查询
 */

router.get("/goods/search", (req, res) => {
    var search = url.parse(req.url, true).query.search;
    const sql = "select * from goods where title like ?";
    SQLConnect(sql, ['%' + search + '%'], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: result
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }
    })
});

/**
 * search keywords
 */
router.get("/keywords", (req, res) => {
    const sql = "select * from keywords";
    SQLConnect(sql, [], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: {
                    result: result
                }
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }

    })
})

/**
 * goodsdetails
 */
router.get("/goods/details", (req, res) => {
    var id = url.parse(req.url, true).query.id;
    const sql = "select * from goodsdetails where id=?";
    SQLConnect(sql, [id], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: result
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }
    })
});

/**
 * 加入购物车
 */

router.post("/cart/add", (req, res) => {
    const { title, price, image, currentID } = req.body;
    console.log("[加购物车] currentID:", currentID, "title:", title);
    const checkSql = "SELECT id, quantity FROM cart WHERE currentID = ?";
    SQLConnect(checkSql, [currentID], (rows) => {
        if (rows && rows.length > 0) {
            const newQty = rows[0].quantity + 1;
            console.log("[加购物车] 已存在, id:", rows[0].id, "数量:", rows[0].quantity, "->", newQty);
            const updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
            SQLConnect(updateSql, [newQty, rows[0].id], (result) => {
                console.log("[加购物车] 更新结果:", result.affectedRows);
                res.send({ status: 200, success: true, msg: "数量+1" });
            });
        } else {
            console.log("[加购物车] 新商品, 执行插入");
            const insertSql = "INSERT INTO cart (title, image, price, currentID, quantity) VALUES (?,?,?,?,1)";
            SQLConnect(insertSql, [title, image, price, currentID], (result) => {
                console.log("[加购物车] 插入结果:", JSON.stringify(result));
                if (result.affectedRows > 0) {
                    res.send({ status: 200, success: true, msg: "添加成功" });
                } else {
                    res.status(500).send({ status: 500, msg: "添加失败" });
                }
            });
        }
    })
});

/**
 * 更新购物车商品数量
 */
router.post("/cart/update", (req, res) => {
    const { id, quantity } = req.body;
    if (!id || !quantity || quantity < 1) {
        return res.status(400).send({ status: 400, msg: "参数错误" });
    }
    const sql = "UPDATE cart SET quantity = ? WHERE id = ?";
    SQLConnect(sql, [quantity, id], (result) => {
        if (result.affectedRows > 0) {
            res.send({ status: 200, success: true });
        } else {
            res.status(500).send({ status: 500, msg: "更新失败" });
        }
    })
});

/**
 * 购物车
 */
router.get("/cart", (req, res) => {
    const sql = "select * from cart";
    SQLConnect(sql, [], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: result
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }
    })
});

/**
 * 删除购物车
 */
router.post("/cart/del", (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send({ status: 400, msg: "缺少参数" });
    }
    const sql = "DELETE FROM cart WHERE id = ?";
    SQLConnect(sql, [id], (result) => {
        if (result.affectedRows > 0) {
            res.send({ status: 200, success: true, msg: "删除成功" });
        } else {
            res.status(500).send({ status: 500, msg: "删除失败" });
        }
    })
});

/**
 * 商品多图
 */
router.get("/goods/images", (req, res) => {
    var goods_id = url.parse(req.url, true).query.goods_id;
    const sql = "SELECT * FROM goods_images WHERE goods_id = ? ORDER BY sort_order ASC";
    SQLConnect(sql, [goods_id], (result) => {
        res.send({ status: 200, data: result || [] });
    })
});

/**
 * 商品评价
 */
router.get("/goods/reviews", (req, res) => {
    var goods_id = url.parse(req.url, true).query.goods_id;
    const sql = "SELECT * FROM goods_reviews WHERE goods_id = ? ORDER BY create_time DESC";
    SQLConnect(sql, [goods_id], (result) => {
        res.send({ status: 200, data: result || [] });
    })
});

/**
 * 初始化 mock 数据（开发用：GET /api/init/mock）
 */
router.get("/init/mock", (req, res) => {
    SQLConnect("SELECT id FROM goods", [], (goods) => {
        if (!goods || goods.length === 0) {
            return res.send({ status: 200, msg: "没有商品数据，请先插入商品" });
        }
        goods.forEach(g => {
            // 每个商品插入3张多图
            SQLConnect("SELECT COUNT(*) as cnt FROM goods_images WHERE goods_id=?", [g.id], (r) => {
                if (r[0].cnt === 0) {
                    for (let i = 1; i <= 3; i++) {
                        SQLConnect("INSERT INTO goods_images (goods_id, image, sort_order) VALUES (?,?,?)",
                            [g.id, '/images/goods/' + g.id + '_' + i + '.webp', i], () => {});
                    }
                }
            });
            // 每个商品插入3条评价
            SQLConnect("SELECT COUNT(*) as cnt FROM goods_reviews WHERE goods_id=?", [g.id], (r) => {
                if (r[0].cnt === 0) {
                    const reviews = [
                        { name: '张三', rating: 5, content: '非常好用，强烈推荐！' },
                        { name: '李四', rating: 4, content: '质量不错，物流很快，好评。' },
                        { name: '王五', rating: 5, content: '性价比很高，会回购的。' }
                    ];
                    reviews.forEach(rv => {
                        SQLConnect("INSERT INTO goods_reviews (goods_id, user_name, rating, content) VALUES (?,?,?,?)",
                            [g.id, rv.name, rv.rating, rv.content], () => {});
                    });
                }
            });
        });
        res.send({ status: 200, msg: "mock数据初始化完成", goodsCount: goods.length });
    })
});

/**
 * 购买商品查询
 */
router.get("/buy", (req, res) => {
    var id = url.parse(req.url, true).query.id;
    const sql = "select * from goods where id=?";
    SQLConnect(sql, [id], (result) => {
        if (result.length > 0) {
            res.send({
                status: 200,
                data: result
            });
        } else {
            res.send({
                status: 500,
                msg: "暂无数据"
            });
        }
    })
});

/**
 * 类别
 */
router.get("/category", (req, res) => {
	    var tag = url.parse(req.url, true).query.tag;
	    // 联表查询：根据分类 tag 查出所有关联商品的完整信息
	    const sql = "SELECT g.* FROM goods g INNER JOIN category c ON g.id = c.goods_id WHERE c.cate = ? ORDER BY g.create_time DESC";
	    SQLConnect(sql, [tag], (result) => {
	        if (result && result.length > 0) {
	            res.send({
	                status: 200,
	                data: result
	            });
	        } else {
	            res.send({
	                status: 200,
	                data: []
	            });
	        }
	    })
	});


/**
 * 登录
 */

router.post("/login", (req, res) => {
    // Mock 登录：直接返回模拟的 openid 和 token，不调用微信接口
    const mockOpenid = "mock_openid_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const mockSessionKey = "mock_session_" + Date.now();
    const token = "mock_token_" + mockOpenid + "_" + Date.now();

    console.log("[Mock登录] openid =", mockOpenid);
    console.log("[Mock登录] token  =", token);

    // 可选：存入数据库（如果 user 表存在的话）
    const sql = "INSERT INTO user (openid, session_key) VALUES (?,?) ON DUPLICATE KEY UPDATE session_key = VALUES(session_key)";
    SQLConnect(sql, [mockOpenid, mockSessionKey], (result) => {
        console.log("[Mock登录] 数据库写入", result.affectedRows > 0 ? "成功" : "跳过");
    });

    res.send({
        status: 200,
        data: { openid: mockOpenid, token: token },
        msg: "登录成功"
    });
})

// ============ 收货地址 API ============

/**
 * 获取地址列表
 */
router.get("/address/list", (req, res) => {
    const sql = "SELECT * FROM address ORDER BY is_default DESC, update_time DESC";
    SQLConnect(sql, [], (result) => {
        res.send({ status: 200, data: result || [] });
    })
})

/**
 * 新增地址
 */
router.post("/address/add", (req, res) => {
    const { name, phone, province, city, district, detail, is_default } = req.body;
    if (is_default) {
        const resetSql = "UPDATE address SET is_default=0";
        SQLConnect(resetSql, [], () => {
            insertAddress();
        });
    } else {
        insertAddress();
    }
    function insertAddress() {
        const sql = "INSERT INTO address (name, phone, province, city, district, detail, is_default) VALUES (?,?,?,?,?,?,?)";
        SQLConnect(sql, [name, phone, province, city, district, detail, is_default ? 1 : 0], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "添加成功" });
            } else {
                res.status(500).send({ status: 500, msg: "添加失败" });
            }
        })
    }
})

/**
 * 更新地址
 */
router.post("/address/update", (req, res) => {
    const { id, name, phone, province, city, district, detail, is_default } = req.body;
    if (is_default) {
        const resetSql = "UPDATE address SET is_default=0";
        SQLConnect(resetSql, [], () => {
            updateAddress();
        });
    } else {
        updateAddress();
    }
    function updateAddress() {
        const sql = "UPDATE address SET name=?, phone=?, province=?, city=?, district=?, detail=?, is_default=? WHERE id=?";
        SQLConnect(sql, [name, phone, province, city, district, detail, is_default ? 1 : 0, id], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "更新成功" });
            } else {
                res.status(500).send({ status: 500, msg: "更新失败" });
            }
        })
    }
})

/**
 * 删除地址
 */
router.post("/address/delete", (req, res) => {
    const { id } = req.body;
    const sql = "DELETE FROM address WHERE id=?";
    SQLConnect(sql, [id], (result) => {
        if (result.affectedRows > 0) {
            res.send({ status: 200, msg: "删除成功" });
        } else {
            res.status(500).send({ status: 500, msg: "删除失败" });
        }
    })
})

/**
 * 设置默认地址
 */
router.post("/address/default", (req, res) => {
    const { id } = req.body;
    const resetSql = "UPDATE address SET is_default=0";
    SQLConnect(resetSql, [], () => {
        const sql = "UPDATE address SET is_default=1 WHERE id=?";
        SQLConnect(sql, [id], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "设置成功" });
            } else {
                res.status(500).send({ status: 500, msg: "设置失败" });
            }
        })
    })
})

// ============ 订单 API ============

/**
 * 生成订单号
 */
function generateOrderNo() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${y}${m}${d}${h}${mi}${s}${random}`;
}

/**
 * 创建订单
 */
router.post("/order/create", (req, res) => {
    const { address_id, items, remark } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).send({ status: 400, msg: "商品不能为空" });
    }
    const order_no = generateOrderNo();
    let total_amount = 0;
    items.forEach(item => {
        total_amount += item.price * item.quantity;
    });
    const freight = total_amount >= 99 ? 0 : 10;
    const pay_amount = total_amount + freight;

    const orderSql = "INSERT INTO orders (order_no, address_id, total_amount, pay_amount, freight, status, remark) VALUES (?,?,?,?,?,0,?)";
    SQLConnect(orderSql, [order_no, address_id, total_amount, pay_amount, freight, remark || ''], (result) => {
        if (result.affectedRows > 0) {
            const orderId = result.insertId;
            let inserted = 0;
            items.forEach(item => {
                const itemSql = "INSERT INTO order_items (order_id, goods_id, title, image, price, quantity) VALUES (?,?,?,?,?,?)";
                SQLConnect(itemSql, [orderId, item.goods_id, item.title, item.image, item.price, item.quantity], () => {
                    inserted++;
                    if (inserted === items.length) {
                        // 清除已下单的购物车商品
                        items.forEach(item => {
                            if (item.cart_id) {
                                SQLConnect("DELETE FROM cart WHERE id=?", [item.cart_id], () => {});
                            }
                        });
                        res.send({
                            status: 200,
                            data: { order_no, order_id: orderId },
                            msg: "订单创建成功"
                        });
                    }
                });
            });
        } else {
            res.status(500).send({ status: 500, msg: "创建失败" });
        }
    })
})

/**
 * 订单列表
 */
router.get("/order/list", (req, res) => {
    const status = url.parse(req.url, true).query.status;
    let sql = "SELECT * FROM orders";
    let params = [];
    if (status !== undefined && status !== '') {
        sql += " WHERE status=?";
        params.push(status);
    }
    sql += " ORDER BY create_time DESC";
    SQLConnect(sql, params, (orders) => {
        if (!orders || orders.length === 0) {
            return res.send({ status: 200, data: [] });
        }
        let completed = 0;
        orders.forEach((order, index) => {
            const itemSql = "SELECT * FROM order_items WHERE order_id=?";
            SQLConnect(itemSql, [order.id], (items) => {
                orders[index].items = items || [];
                completed++;
                if (completed === orders.length) {
                    res.send({ status: 200, data: orders });
                }
            });
        });
    })
})

/**
 * 订单详情
 */
router.get("/order/detail", (req, res) => {
    const order_no = url.parse(req.url, true).query.order_no;
    const sql = "SELECT * FROM orders WHERE order_no=?";
    SQLConnect(sql, [order_no], (orders) => {
        if (orders && orders.length > 0) {
            const order = orders[0];
            const itemSql = "SELECT * FROM order_items WHERE order_id=?";
            SQLConnect(itemSql, [order.id], (items) => {
                order.items = items || [];
                // 如果有地址，查询地址信息
                if (order.address_id) {
                    const addrSql = "SELECT * FROM address WHERE id=?";
                    SQLConnect(addrSql, [order.address_id], (addrs) => {
                        order.address = addrs && addrs.length > 0 ? addrs[0] : null;
                        res.send({ status: 200, data: order });
                    });
                } else {
                    order.address = null;
                    res.send({ status: 200, data: order });
                }
            });
        } else {
            res.send({ status: 500, msg: "订单不存在" });
        }
    })
})

/**
 * 取消订单
 */
router.post("/order/cancel", (req, res) => {
    const { order_no } = req.body;
    const sql = "UPDATE orders SET status=4 WHERE order_no=? AND status=0";
    SQLConnect(sql, [order_no], (result) => {
        if (result.affectedRows > 0) {
            res.send({ status: 200, msg: "取消成功" });
        } else {
            res.status(500).send({ status: 500, msg: "取消失败" });
        }
    })
})

/**
 * 确认收货
 */
router.post("/order/confirm", (req, res) => {
    const { order_no } = req.body;
    const sql = "UPDATE orders SET status=3, receive_time=NOW() WHERE order_no=? AND status=2";
    SQLConnect(sql, [order_no], (result) => {
        if (result.affectedRows > 0) {
            res.send({ status: 200, msg: "确认成功" });
        } else {
            res.status(500).send({ status: 500, msg: "确认失败" });
        }
    })
})

/**
 * 模拟支付（开发环境）
 */
router.post("/pay/create", (req, res) => {
    const { order_no } = req.body;
    const sql = "UPDATE orders SET status=1, pay_time=NOW() WHERE order_no=? AND status=0";
    SQLConnect(sql, [order_no], (result) => {
        if (result.affectedRows > 0) {
            res.send({ status: 200, msg: "支付成功" });
        } else {
            res.status(500).send({ status: 500, msg: "支付失败" });
        }
    })
})
// ============ 智能客服 API ============

/**
 * 知识库 - 关键词匹配回复
 */
const knowledgeBase = [
    {
        keywords: ['物流', '快递', '发货', '配送', '送到', '多久', '什么时候到', '多长时间'],
        reply: '📦 关于物流：\n\n1. 您可以在"我的订单"中查看订单物流状态\n2. 一般下单后 24-48 小时内发货\n3. 国内快递通常 3-5 天送达\n\n如需查询具体订单物流，请提供订单号，我来帮您查询。'
    },
    {
        keywords: ['退', '换', '退款', '退货', '售后', '退还'],
        reply: '🔄 退换货政策：\n\n• 7天无理由退换货\n• 商品需保持原包装完好\n• 退款将在 3-5 个工作日内原路返回\n\n您可以在"我的订单"中找到对应订单，点击"申请售后"提交退换货申请。'
    },
    {
        keywords: ['优惠', '券', '折扣', '活动', '满减'],
        reply: '🎫 优惠券使用：\n\n1. 您可以在"我的-优惠券"中查看可用优惠券\n2. 下单时选择可用的优惠券即可自动抵扣\n3. 每张优惠券有使用门槛和有效期\n\n如需领取新优惠券，可以关注首页的优惠活动。'
    },
    {
        keywords: ['支付', '付款', '钱', '微信', '支付宝', '银联'],
        reply: '💳 支付方式：\n\n我们支持以下支付方式：\n• 微信支付\n• 支付宝\n• 银联卡\n\n如果支付遇到问题，请检查网络连接或更换支付方式重试。'
    },
    {
        keywords: ['账户', '密码', '登录', '注册', '绑定', '手机号'],
        reply: '👤 账户问题：\n\n• 您可以使用微信一键登录\n• 忘记密码可通过绑定的手机号找回\n• 如需修改个人信息，可在"我的-设置"中操作\n\n如有其他账户问题，请联系人工客服。'
    },
    {
        keywords: ['人工', '客服', '找人工', '转人工', '真人'],
        reply: '👨‍💼 如需联系人工客服，您可以通过以下方式：\n\n• 客服热线：400-888-8888\n• 服务时间：9:00 - 21:00\n\n您也可以留下联系方式，我们会尽快安排客服人员与您联系。'
    },
    {
        keywords: ['你好', 'hi', 'hello', '在吗', '嗨', '早上好', '下午好', '晚上好'],
        reply: '您好！😊 我是智能客服小美，很高兴为您服务！\n\n请问有什么可以帮您的吗？'
    },
    {
        keywords: ['谢谢', '感谢', '谢了', '多谢', 'thanks'],
        reply: '不客气！很高兴能帮到您 😊\n\n如果还有其他问题，随时可以问我哦~'
    },
    {
        keywords: ['商品', '产品', '质量', '正品', '保证'],
        reply: '🏷️ 商品质量保障：\n\n• 我们承诺所有商品均为正品\n• 支持7天无理由退换货\n• 如有质量问题，可免费退换\n\n您可以在商品详情页查看其他用户的评价作为参考。'
    },
    {
        keywords: ['积分', '签到', '会员'],
        reply: '💰 积分与会员：\n\n• 每日签到可获得积分\n• 购物消费可获得积分返点\n• 积分可在"积分商城"中兑换商品\n• 会员等级越高，享受的权益越多\n\n快去签到赚取积分吧！'
    },
    {
        keywords: ['地址', '收货', '配送地址', '改地址'],
        reply: '📍 收货地址管理：\n\n• 您可以在"我的-收货地址"中管理地址\n• 下单时可选择已有地址或新增地址\n• 可设置默认收货地址\n\n如需修改订单收货地址，请在发货前联系客服。'
    }
];

function findBestReply(message) {
    const msg = message.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    for (const item of knowledgeBase) {
        let score = 0;
        for (const keyword of item.keywords) {
            if (msg.includes(keyword.toLowerCase())) {
                score += keyword.length;
            }
        }
        if (score > 0 && score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }
    if (bestMatch) {
        return bestMatch.reply;
    }
    return '抱歉，我可能没有完全理解您的问题 🤔\n\n您可以尝试询问以下问题：\n• 订单物流查询\n• 退换货政策\n• 优惠券使用\n• 支付方式\n• 账户问题\n\n或者输入"人工"联系人工客服（400-888-8888）。';
}

/**
 * 发送聊天消息
 * POST /api/chat/send
 * Body: { message: string, sessionId: string }
 */
router.post("/chat/send", (req, res) => {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).send({ status: 400, msg: "消息内容不能为空" });
    }
    console.log("[客服聊天] sessionId:", sessionId, "消息:", message);
    const reply = findBestReply(message.trim());
    const delay = 300 + Math.random() * 700;
    setTimeout(() => {
        res.send({
            status: 200,
            data: {
                reply: reply,
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            }
        });
    }, delay);
})
// ============ 商品管理后台 API ============

/**
 * 添加商品
 * POST /api/admin/goods/add
 * Body: { title, price, image, description, stock, category }
 *   category: 分类标签，如 phone/computer/earphone/appliance/clothing/food
 */
router.post("/admin/goods/add", (req, res) => {
    const { title, price, image, description, stock, category } = req.body;
    if (!title || !price) {
        return res.status(400).send({ status: 400, msg: "商品名称和价格不能为空" });
    }
    const sql = "INSERT INTO goods (title, price, image, description, stock) VALUES (?,?,?,?,?)";
    SQLConnect(sql, [title, price || 0, image || '', description || '', stock || 100], (result) => {
        if (result.affectedRows > 0) {
            const goodsId = result.insertId;
            // 如果指定了分类，自动写入 category 表
            if (category) {
                const cateSql = "INSERT INTO category (cate, goods_id) VALUES (?,?)";
                SQLConnect(cateSql, [category, goodsId], () => {});
            }
            res.send({ status: 200, msg: "添加成功", data: { id: goodsId } });
        } else {
            res.status(500).send({ status: 500, msg: "添加失败" });
        }
    });
});

/**
 * 获取商品列表（带分页）
 * GET /api/admin/goods/list?page=1&pageSize=20
 */
router.get("/admin/goods/list", (req, res) => {
    const page = parseInt(url.parse(req.url, true).query.page) || 1;
    const pageSize = parseInt(url.parse(req.url, true).query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    // 先查总数
    SQLConnect("SELECT COUNT(*) as total FROM goods", [], (countResult) => {
        const total = countResult[0].total;
        const sql = "SELECT * FROM goods ORDER BY create_time DESC LIMIT ? OFFSET ?";
        SQLConnect(sql, [pageSize, offset], (result) => {
            res.send({
                status: 200,
                data: {
                    list: result || [],
                    total: total,
                    page: page,
                    pageSize: pageSize,
                    totalPage: Math.ceil(total / pageSize)
                }
            });
        });
    });
});

/**
 * 删除商品
 * POST /api/admin/goods/delete
 * Body: { id }
 */
router.post("/admin/goods/delete", (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send({ status: 400, msg: "缺少商品ID" });
    }
    // 先删分类关联
    SQLConnect("DELETE FROM category WHERE goods_id=?", [id], () => {
        // 再删商品
        SQLConnect("DELETE FROM goods WHERE id=?", [id], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "删除成功" });
            } else {
                res.status(500).send({ status: 500, msg: "商品不存在或删除失败" });
            }
        });
    });
});

/**
 * 修改商品
 * POST /api/admin/goods/update
 * Body: { id, title, price, image, description, stock }
 */
router.post("/admin/goods/update", (req, res) => {
    const { id, title, price, image, description, stock, category } = req.body;
    if (!id) {
        return res.status(400).send({ status: 400, msg: "缺少商品ID" });
    }
    const sql = "UPDATE goods SET title=?, price=?, image=?, description=?, stock=? WHERE id=?";
    SQLConnect(sql, [title, price, image, description, stock, id], (result) => {
        if (result.affectedRows > 0) {
            if (category !== undefined) {
                SQLConnect("DELETE FROM category WHERE goods_id=?", [id], () => {
                    if (category) {
                        SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [category, id], () => {});
                    }
                });
            }
            res.send({ status: 200, msg: "修改成功" });
        } else {
            res.status(500).send({ status: 500, msg: "商品不存在或修改失败" });
        }
    });
});

/**
 * 获取所有分类及其商品数量
 * GET /api/admin/category/list
 */
router.get("/admin/category/list", (req, res) => {
    const sql = "SELECT cate, COUNT(*) as count, GROUP_CONCAT(goods_id) as goods_ids FROM category GROUP BY cate ORDER BY cate";
    SQLConnect(sql, [], (result) => {
        const categories = (result || []).map(item => ({
            name: item.cate,
            count: item.count,
            goodsIds: item.goods_ids ? item.goods_ids.split(',').map(Number) : []
        }));
        res.send({ status: 200, data: categories });
    });
});

/**
 * 修改商品分类
 * POST /api/admin/goods/setCategory
 * Body: { goodsId, category }
 *   category: 分类标签，如 phone/computer/earphone/appliance/clothing/food
 */
router.post("/admin/goods/setCategory", (req, res) => {
    const { goodsId, category } = req.body;
    if (!goodsId || !category) {
        return res.status(400).send({ status: 400, msg: "缺少参数" });
    }
    // 先删除旧分类关联
    SQLConnect("DELETE FROM category WHERE goods_id=?", [goodsId], () => {
        // 插入新分类关联
        SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [category, goodsId], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "分类设置成功" });
            } else {
                res.status(500).send({ status: 500, msg: "设置失败" });
            }
        });
    });
});

/**
 * 批量添加商品（一次性添加多个）
 * POST /api/admin/goods/batchAdd
 * Body: { goods: [{ title, price, image, description, stock, category }, ...] }
 */
router.post("/admin/goods/batchAdd", (req, res) => {
    const { goods } = req.body;
    if (!goods || !Array.isArray(goods) || goods.length === 0) {
        return res.status(400).send({ status: 400, msg: "商品列表不能为空" });
    }
    let success = 0;
    let fail = 0;
    let total = goods.length;
    goods.forEach(item => {
        const sql = "INSERT INTO goods (title, price, image, description, stock) VALUES (?,?,?,?,?)";
        SQLConnect(sql, [item.title, item.price || 0, item.image || '', item.description || '', item.stock || 100], (result) => {
            if (result.affectedRows > 0) {
                success++;
                if (item.category) {
                    SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [item.category, result.insertId], () => {});
                }
            } else {
                fail++;
            }
            // 全部处理完返回结果
            if (success + fail === total) {
                res.send({ status: 200, msg: "批量添加完成", data: { success, fail, total } });
            }
        });
    });
});

/**
 * 初始化示例数据（开发用，一键插入测试商品）
 * GET /api/admin/init/demo
 */
router.get("/admin/init/demo", (req, res) => {
    const demoGoods = [
        { title: 'iPhone 15 Pro', price: 7999, image: 'https://placehold.co/400x400/e3f2fd/1565c0?text=iPhone+15+Pro', description: '苹果最新旗舰手机，A17 Pro芯片', stock: 50, category: 'phone' },
        { title: '华为 Mate 60 Pro', price: 6999, image: 'https://placehold.co/400x400/fce4ec/c62828?text=Mate+60+Pro', description: '华为旗舰，麒麟芯片回归', stock: 30, category: 'phone' },
        { title: '小米14 Ultra', price: 5999, image: 'https://placehold.co/400x400/fff3e0/ef6c00?text=Xiaomi+14', description: '徕卡影像旗舰', stock: 80, category: 'phone' },
        { title: 'MacBook Pro 14', price: 14999, image: 'https://placehold.co/400x400/e8eaf6/3949ab?text=MacBook+Pro', description: 'M3 Pro芯片，专业级性能', stock: 20, category: 'computer' },
        { title: '联想 ThinkPad X1', price: 9999, image: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=ThinkPad+X1', description: '商务办公首选', stock: 40, category: 'computer' },
        { title: 'AirPods Pro 2', price: 1899, image: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=AirPods+Pro', description: '主动降噪，空间音频', stock: 100, category: 'earphone' },
        { title: '索尼 WH-1000XM5', price: 2499, image: 'https://placehold.co/400x400/fce4ec/c62828?text=Sony+XM5', description: '业界顶级降噪耳机', stock: 60, category: 'earphone' },
        { title: '戴森吸尘器 V15', price: 4999, image: 'https://placehold.co/400x400/fff8e1/ff8f00?text=Dyson+V15', description: '强劲吸力，激光探测', stock: 25, category: 'appliance' },
        { title: '优衣库羽绒服', price: 599, image: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Down+Jacket', description: '轻薄保暖，多色可选', stock: 200, category: 'clothing' },
        { title: '三只松鼠坚果礼盒', price: 168, image: 'https://placehold.co/400x400/f1f8e9/558b2f?text=Nut+Gift', description: '精选坚果，送礼佳品', stock: 300, category: 'food' },
    ];

    let success = 0;
    let fail = 0;
    const total = demoGoods.length;

    demoGoods.forEach(item => {
        const sql = "INSERT INTO goods (title, price, image, description, stock) VALUES (?,?,?,?,?)";
        SQLConnect(sql, [item.title, item.price, item.image, item.description, item.stock], (result) => {
            if (result.affectedRows > 0) {
                success++;
                SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [item.category, result.insertId], () => {});
            } else {
                fail++;
            }
            if (success + fail === total) {
                res.send({ status: 200, msg: "示例数据初始化完成", data: { success, fail, total } });
            }
        });
    });
});



// ============ 商品管理后台 API ============

/**
 * 添加商品
 * POST /api/admin/goods/add
 * Body: { title, price, image, description, stock, category }
 *   category: 分类标签，如 phone/computer/earphone/appliance/clothing/food
 */
router.post("/admin/goods/add", (req, res) => {
    const { title, price, image, description, stock, category } = req.body;
    if (!title || !price) {
        return res.status(400).send({ status: 400, msg: "商品名称和价格不能为空" });
    }
    const sql = "INSERT INTO goods (title, price, image, description, stock) VALUES (?,?,?,?,?)";
    SQLConnect(sql, [title, price || 0, image || '', description || '', stock || 100], (result) => {
        if (result.affectedRows > 0) {
            const goodsId = result.insertId;
            // 如果指定了分类，自动写入 category 表
            if (category) {
                const cateSql = "INSERT INTO category (cate, goods_id) VALUES (?,?)";
                SQLConnect(cateSql, [category, goodsId], () => {});
            }
            res.send({ status: 200, msg: "添加成功", data: { id: goodsId } });
        } else {
            res.status(500).send({ status: 500, msg: "添加失败" });
        }
    });
});

/**
 * 获取商品列表（带分页）
 * GET /api/admin/goods/list?page=1&pageSize=20
 */
router.get("/admin/goods/list", (req, res) => {
    const page = parseInt(url.parse(req.url, true).query.page) || 1;
    const pageSize = parseInt(url.parse(req.url, true).query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    // 先查总数
    SQLConnect("SELECT COUNT(*) as total FROM goods", [], (countResult) => {
        const total = countResult[0].total;
        const sql = "SELECT * FROM goods ORDER BY create_time DESC LIMIT ? OFFSET ?";
        SQLConnect(sql, [pageSize, offset], (result) => {
            res.send({
                status: 200,
                data: {
                    list: result || [],
                    total: total,
                    page: page,
                    pageSize: pageSize,
                    totalPage: Math.ceil(total / pageSize)
                }
            });
        });
    });
});

/**
 * 删除商品
 * POST /api/admin/goods/delete
 * Body: { id }
 */
router.post("/admin/goods/delete", (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send({ status: 400, msg: "缺少商品ID" });
    }
    // 先删分类关联
    SQLConnect("DELETE FROM category WHERE goods_id=?", [id], () => {
        // 再删商品
        SQLConnect("DELETE FROM goods WHERE id=?", [id], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "删除成功" });
            } else {
                res.status(500).send({ status: 500, msg: "商品不存在或删除失败" });
            }
        });
    });
});

/**
 * 修改商品
 * POST /api/admin/goods/update
 * Body: { id, title, price, image, description, stock }
 */
router.post("/admin/goods/update", (req, res) => {
    const { id, title, price, image, description, stock, category } = req.body;
    if (!id) {
        return res.status(400).send({ status: 400, msg: "缺少商品ID" });
    }
    const sql = "UPDATE goods SET title=?, price=?, image=?, description=?, stock=? WHERE id=?";
    SQLConnect(sql, [title, price, image, description, stock, id], (result) => {
        if (result.affectedRows > 0) {
            if (category !== undefined) {
                SQLConnect("DELETE FROM category WHERE goods_id=?", [id], () => {
                    if (category) {
                        SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [category, id], () => {});
                    }
                });
            }
            res.send({ status: 200, msg: "修改成功" });
        } else {
            res.status(500).send({ status: 500, msg: "商品不存在或修改失败" });
        }
    });
});

/**
 * 获取所有分类及其商品数量
 * GET /api/admin/category/list
 */
router.get("/admin/category/list", (req, res) => {
    const sql = "SELECT cate, COUNT(*) as count, GROUP_CONCAT(goods_id) as goods_ids FROM category GROUP BY cate ORDER BY cate";
    SQLConnect(sql, [], (result) => {
        const categories = (result || []).map(item => ({
            name: item.cate,
            count: item.count,
            goodsIds: item.goods_ids ? item.goods_ids.split(',').map(Number) : []
        }));
        res.send({ status: 200, data: categories });
    });
});

/**
 * 修改商品分类
 * POST /api/admin/goods/setCategory
 * Body: { goodsId, category }
 *   category: 分类标签，如 phone/computer/earphone/appliance/clothing/food
 */
router.post("/admin/goods/setCategory", (req, res) => {
    const { goodsId, category } = req.body;
    if (!goodsId || !category) {
        return res.status(400).send({ status: 400, msg: "缺少参数" });
    }
    // 先删除旧分类关联
    SQLConnect("DELETE FROM category WHERE goods_id=?", [goodsId], () => {
        // 插入新分类关联
        SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [category, goodsId], (result) => {
            if (result.affectedRows > 0) {
                res.send({ status: 200, msg: "分类设置成功" });
            } else {
                res.status(500).send({ status: 500, msg: "设置失败" });
            }
        });
    });
});

/**
 * 批量添加商品（一次性添加多个）
 * POST /api/admin/goods/batchAdd
 * Body: { goods: [{ title, price, image, description, stock, category }, ...] }
 */
router.post("/admin/goods/batchAdd", (req, res) => {
    const { goods } = req.body;
    if (!goods || !Array.isArray(goods) || goods.length === 0) {
        return res.status(400).send({ status: 400, msg: "商品列表不能为空" });
    }
    let success = 0;
    let fail = 0;
    let total = goods.length;
    goods.forEach(item => {
        const sql = "INSERT INTO goods (title, price, image, description, stock) VALUES (?,?,?,?,?)";
        SQLConnect(sql, [item.title, item.price || 0, item.image || '', item.description || '', item.stock || 100], (result) => {
            if (result.affectedRows > 0) {
                success++;
                if (item.category) {
                    SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [item.category, result.insertId], () => {});
                }
            } else {
                fail++;
            }
            // 全部处理完返回结果
            if (success + fail === total) {
                res.send({ status: 200, msg: "批量添加完成", data: { success, fail, total } });
            }
        });
    });
});

/**
 * 初始化示例数据（开发用，一键插入测试商品）
 * GET /api/admin/init/demo
 */
router.get("/admin/init/demo", (req, res) => {
    const demoGoods = [
        { title: 'iPhone 15 Pro', price: 7999, image: 'https://placehold.co/400x400/e3f2fd/1565c0?text=iPhone+15+Pro', description: '苹果最新旗舰手机，A17 Pro芯片', stock: 50, category: 'phone' },
        { title: '华为 Mate 60 Pro', price: 6999, image: 'https://placehold.co/400x400/fce4ec/c62828?text=Mate+60+Pro', description: '华为旗舰，麒麟芯片回归', stock: 30, category: 'phone' },
        { title: '小米14 Ultra', price: 5999, image: 'https://placehold.co/400x400/fff3e0/ef6c00?text=Xiaomi+14', description: '徕卡影像旗舰', stock: 80, category: 'phone' },
        { title: 'MacBook Pro 14', price: 14999, image: 'https://placehold.co/400x400/e8eaf6/3949ab?text=MacBook+Pro', description: 'M3 Pro芯片，专业级性能', stock: 20, category: 'computer' },
        { title: '联想 ThinkPad X1', price: 9999, image: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=ThinkPad+X1', description: '商务办公首选', stock: 40, category: 'computer' },
        { title: 'AirPods Pro 2', price: 1899, image: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=AirPods+Pro', description: '主动降噪，空间音频', stock: 100, category: 'earphone' },
        { title: '索尼 WH-1000XM5', price: 2499, image: 'https://placehold.co/400x400/fce4ec/c62828?text=Sony+XM5', description: '业界顶级降噪耳机', stock: 60, category: 'earphone' },
        { title: '戴森吸尘器 V15', price: 4999, image: 'https://placehold.co/400x400/fff8e1/ff8f00?text=Dyson+V15', description: '强劲吸力，激光探测', stock: 25, category: 'appliance' },
        { title: '优衣库羽绒服', price: 599, image: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Down+Jacket', description: '轻薄保暖，多色可选', stock: 200, category: 'clothing' },
        { title: '三只松鼠坚果礼盒', price: 168, image: 'https://placehold.co/400x400/f1f8e9/558b2f?text=Nut+Gift', description: '精选坚果，送礼佳品', stock: 300, category: 'food' },
    ];

    let success = 0;
    let fail = 0;
    const total = demoGoods.length;

    demoGoods.forEach(item => {
        const sql = "INSERT INTO goods (title, price, image, description, stock) VALUES (?,?,?,?,?)";
        SQLConnect(sql, [item.title, item.price, item.image, item.description, item.stock], (result) => {
            if (result.affectedRows > 0) {
                success++;
                SQLConnect("INSERT INTO category (cate, goods_id) VALUES (?,?)", [item.category, result.insertId], () => {});
            } else {
                fail++;
            }
            if (success + fail === total) {
                res.send({ status: 200, msg: "示例数据初始化完成", data: { success, fail, total } });
            }
        });
    });
});





/**
 * 图片上传接口
 * POST /api/admin/goods/upload
 * Content-Type: multipart/form-data
 * Body: file
 */
router.post("/admin/goods/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ status: 400, msg: "请选择要上传的图片" });
    }
    const imageUrl = "/images/goods/" + req.file.filename;
    res.send({ status: 200, msg: "上传成功", data: { url: imageUrl } });
}, (err, req, res, next) => {
    res.status(400).send({ status: 400, msg: err.message || "上传失败" });
});

module.exports = router;