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
    const sql = "insert into cart (title, image, price, currentID) values (?,?,?,?)";
    SQLConnect(sql, [title, image, price, currentID], (result) => {
        if (result.affectedRows > 0) {
            res.send({
                status: 200,
                success: true,
                msg: "添加成功"
            })
        } else {
            res.status(500).send({
                status: 500,
                msg: "添加失败"
            });
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
router.get("/cart/del", (req, res) => {
    var id = url.parse(req.url, true).query.currentID;
    const sql = "DELETE FROM cart WHERE id=?";
    SQLConnect(sql, [id], (result) => {
        if (result.affectedRows > 0) {
            res.send({
                status: 200,
                success: true
            })
        } else {
            res.status(500).send({
                msg: "删除失败"
            });
        }
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
    const { code } = req.body;
    console.log(" 传入临时登录凭证js_code，返回当前用户的openid和session_key ")
    console.log(" 微信接口 https://api.weixin.qq.com/sns/jscode2session ")
    console.log(" 临时凭证 js_code   =",code)
    console.log(" 临时凭证 appid     =",appid)
    console.log(" 临时凭证 secret    =",secret)
    console.log(" 临时凭证 grant_type=",authorization_code)

    request(`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=${authorization_code}`, (err, response, body) => {
        if (err) console.log(err);
        const data = JSON.parse(body);
        console.log("返回值openid  = ",data.openid)
        console.log("返回值session_key  = ",data.session_key)

        // 生成token，实际生成环境一般用JWT生成
        const token = `mock_token_for_${data.openid}_${Date.now()}`;

        console.log("将openid存入user表");
        const sql = "insert into user (openid, session_key) values (?,?) on duplicate key update session_key = values(session_key)"
        if(data.openid && data.session_key){
            SQLConnect(sql, [data.openid,data.session_key], (result) => {
                if (result.affectedRows > 0) {
                    res.send({
                        status: 200,
                        data: {openid:data.openid,token:token},
                        msg: "登录成功"
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        msg: "登录失败"
                    });
                }
            })
        }else{
            res.send({
                status:500,
                msg:"登录失败"
            })
        }
    })
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