Page({
  data: {
    title: '购物小程序',
    hotProducts: [
      {
        id: 1,
        name: '苹果手机',
        price: 5999,
        image: '/images/phone.jpg'
      },
      {
        id: 2,
        name: '笔记本电脑',
        price: 8999,
        image: '/images/laptop.jpg'
      },
      {
        id: 3,
        name: '无线耳机',
        price: 299,
        image: '/images/earphone.jpg'
      }
    ]
  },

  onLoad: function() {
    console.log('首页加载');
  },

  onReady: function() {
    console.log('首页渲染完成');
  },

  goToProducts: function() {
    wx.switchTab({
      url: '/pages/products/products'
    });
  },

  goToCart: function() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },

  goToProfile: function() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    });
  }
});