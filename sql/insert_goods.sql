-- 插入示例商品数据
INSERT INTO goods (id, title, price, image, description, stock, sales) VALUES
(1001, '松下（Panasonic）DC-BS1HGK微单相机 数码相机 模块化摄影机 视频 直播多机位 电影', 21298.00, 'https://placehold.co/400x400/e0e0e0/999999?text=Panasonic+BS1HGK', '松下DC-BS1HGK微单相机，模块化设计，支持视频直播多机位拍摄，专业级电影画质。', 50, 12),
(1002, '南孚5号充电锂电池4粒套装 1.5V恒压快充 TENAVOLTS 适用游戏手柄/键鼠/话筒/吸奶器/血压计/闪光灯等 AA五号', 159.00, 'https://placehold.co/400x400/e0e0e0/999999?text=南孚锂电池', '南孚充电锂电池，1.5V恒压输出，快充技术，适用于游戏手柄、键鼠、话筒等多种设备。', 200, 85),
(1003, '佳能（Canon） 5d4 5D Mark IV全画幅专业级4K高清视频数码单反相机套机 佳能5D4 5D4单机身/拆机身（不含镜头） 官方标配', 15988.00, 'https://placehold.co/400x400/e0e0e0/999999?text=Canon+5D4', '佳能5D Mark IV全画幅专业单反，4K高清视频，3040万像素，61点自动对焦系统。', 30, 8),
(1004, '倍思 氮化镓GaN100W充电器套装适用pd20W苹果13/12手机多口Type-C快充头MacBook华为小米笔记本电脑65W插头黑', 199.00, 'https://placehold.co/400x400/e0e0e0/999999?text=倍思100W充电器', '倍思氮化镓100W充电器，多口输出，兼容PD/QC快充协议，支持手机、笔记本等多种设备快充。', 150, 67),
(1005, '佳能（Canon） 5d4 Mark IV专业级全画幅高级单反摄影像照相机 24-70+70-200+闪光灯+手柄+套餐五', 60499.00, 'https://placehold.co/400x400/e0e0e0/999999?text=Canon+5D4+套机', '佳能5D4专业套机，含24-70mm和70-200mm镜头、闪光灯、手柄等全套配件，专业摄影首选。', 10, 3),
(1006, 'kapaier小提琴弱音器专业消音器减小音静音 提琴配件 小提琴【4/4-3/4-1/2】', 68.00, 'https://placehold.co/400x400/e0e0e0/999999?text=小提琴弱音器', 'kapaier专业小提琴弱音器，有效降低音量，不伤琴弦，适用于4/4、3/4、1/2规格小提琴。', 100, 25),
(1007, '徕纳 适用EOS5D4相机兔笼佳能5D3单反微单相机5d2兔笼配件拓展套件多接口铝合金全包防摔保护框 黑色', 310.00, 'https://placehold.co/400x400/e0e0e0/999999?text=佳能兔笼', '徕纳相机兔笼，铝合金全包设计，多接口扩展，防摔保护，兼容佳能5D4/5D3/5D2等机型。', 80, 15),
(1008, 'Apple iPhone 11 (A2223) 128GB 黑色 移动联通电信4G手机 双卡双待', 4099.00, 'https://placehold.co/400x400/e0e0e0/999999?text=iPhone+11', 'Apple iPhone 11，128GB存储，6.1英寸Liquid视网膜显示屏，A13仿生芯片，双摄像头系统。', 60, 42),
(1009, 'ROKID Air 若琪智能眼镜 AR眼镜手机电脑投屏眼镜非VR一体机游戏3D大屏显示器虚拟 太空银', 2999.00, 'https://placehold.co/400x400/e0e0e0/999999?text=ROKID+Air', 'ROKID Air AR智能眼镜，手机电脑投屏，3D大屏显示，轻量化设计，支持DP输出设备。', 40, 18),
(1010, '倍思 氮化镓GaN三代65W充电器套装适用20W苹果13/12多口PD快充头华为小米macbook笔记本适配插头100W数据线黑', 118.00, 'https://placehold.co/400x400/e0e0e0/999999?text=倍思65W充电器', '倍思氮化镓三代65W充电器，小巧便携，支持多口PD快充，兼容苹果、华为、小米等设备。', 180, 95);

-- 插入搜索关键词
INSERT INTO keywords (keyword, sort_order) VALUES
('手机', 1),
('相机', 2),
('耳机', 3),
('电脑', 4),
('充电器', 5),
('苹果', 6),
('佳能', 7),
('单反', 8);

-- 插入轮播图数据
INSERT INTO banner (image, link, sort_order) VALUES
('https://placehold.co/750x300/4a90d9/ffffff?text=Banner+1', '/pages/category/category', 1),
('https://placehold.co/750x300/50c878/ffffff?text=Banner+2', '/pages/category/category', 2),
('https://placehold.co/750x300/ff6b6b/ffffff?text=Banner+3', '/pages/category/category', 3);

-- 插入分类关联数据
INSERT INTO category (cate, goods_id) VALUES
('camera', 1001),
('appliance', 1002),
('camera', 1003),
('appliance', 1004),
('camera', 1005),
('appliance', 1006),
('camera', 1007),
('phone', 1008),
('computer', 1009),
('appliance', 1010);
