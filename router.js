const express = require("express");
const router = express.Router();
const SQLConnect = require("./SQLConnect.js");
const url = require("url");
const request = require("request");
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
    const sql = "select * from category where cate=?";
    SQLConnect(sql, [tag], (result) => {
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


module.exports = router;