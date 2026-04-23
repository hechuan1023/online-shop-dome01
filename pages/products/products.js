Page({
  data: {
    products: [
      {
        id: 1,
        name: '苹果手机',
        price: 5999,
        description: '最新款iPhone，性能强劲',
        image: '/images/phone.jpg'
      },
      {
        id: 2,
        name: '笔记本电脑',
        price: 8999,
        description: '轻薄便携，办公首选',
        image: '/images/laptop.jpg'
      },
      {
        id: 3,
        name: '无线耳机',
        price: 299,
        description: '音质清晰，降噪效果好',
        image: '/images/earphone.jpg'
      }
    ]
  },

  onLoad: function(options) {
    console.log('商品列表页面加载');
  },

  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    });
  }
});