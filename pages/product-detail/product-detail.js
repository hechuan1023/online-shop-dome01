Page({
  data: {
    product: {},
    productId: null
  },

  onLoad: function(options) {
    const productId = options.id;
    this.setData({
      productId: productId
    });
    this.loadProductDetail(productId);
  },

  loadProductDetail: function(productId) {
    // 模拟商品数据，实际项目中应该从服务器获取
    const products = {
      '1': {
        id: 1,
        name: '苹果手机',
        price: 5999,
        description: '最新款iPhone，采用A16仿生芯片，拍照效果出色，电池续航能力强。支持5G网络，运行流畅。',
        image: '/images/phone.jpg',
        specs: [
          { key: '品牌', value: '苹果' },
          { key: '型号', value: 'iPhone 14' },
          { key: '内存', value: '128GB' },
          { key: '颜色', value: '深空灰' }
        ]
      },
      '2': {
        id: 2,
        name: '笔记本电脑',
        price: 8999,
        description: '轻薄便携设计，搭载最新处理器，适合办公和娱乐。高分辨率显示屏，长续航电池。',
        image: '/images/laptop.jpg',
        specs: [
          { key: '品牌', value: '联想' },
          { key: '型号', value: 'ThinkPad X1' },
          { key: '处理器', value: 'Intel i7' },
          { key: '内存', value: '16GB' }
        ]
      },
      '3': {
        id: 3,
        name: '无线耳机',
        price: 299,
        description: '高品质音质，主动降噪技术，舒适佩戴设计。蓝牙5.0连接，长续航，适合运动和日常使用。',
        image: '/images/earphone.jpg',
        specs: [
          { key: '品牌', value: '小米' },
          { key: '连接方式', value: '蓝牙5.0' },
          { key: '续航时间', value: '24小时' },
          { key: '降噪', value: '主动降噪' }
        ]
      }
    };

    const product = products[productId] || products['1'];
    this.setData({
      product: product
    });
  },

  addToCart: function() {
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });

    // 这里应该调用后端API添加到购物车
    console.log('添加到购物车:', this.data.product);
  },

  buyNow: function() {
    wx.showToast({
      title: '跳转到结算页面',
      icon: 'none'
    });

    // 这里应该跳转到订单确认页面
    console.log('立即购买:', this.data.product);
  }
});