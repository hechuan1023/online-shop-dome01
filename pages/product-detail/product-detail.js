const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    product: null,
    productId: null,
    loading: true
  },

  onLoad: function(options) {
    const id = options.id;
    this.setData({ productId: id });
    this.loadProductDetail(id);
  },

  onShareAppMessage: function() {
    const product = this.data.product;
    return {
      title: product ? product.title : '商品详情',
      path: '/pages/product-detail/product-detail?id=' + this.data.productId
    };
  },

  loadProductDetail: function(id) {
    this.setData({ loading: true });
    request({
      url: '/goods/details',
      data: { id: id }
    }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const product = {
          ...res.data[0],
          image: res.data[0].image.startsWith('http') ? res.data[0].image : app.globalData.serverUrl + res.data[0].image
        };
        this.setData({ product });
        wx.getImageInfo({
          src: product.image,
          success: (imgRes) => {
            this.setData({ 'product.localImage': imgRes.path });
          }
        });
      } else {
        wx.showToast({ title: '商品不存在', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  previewImage: function() {
    const product = this.data.product;
    if (product && product.image) {
      wx.previewImage({
        current: product.image,
        urls: [product.image]
      });
    }
  },

  addToCart: function() {
    const product = this.data.product;
    if (!product) return;
    request({
      url: '/cart/add',
      method: 'POST',
      data: {
        title: product.title,
        price: product.price,
        image: product.image,
        currentID: product.id
      }
    }).then(res => {
      if (res.status === 200) {
        wx.showToast({ title: '已加入购物车', icon: 'success' });
      } else {
        wx.showToast({ title: res.msg || '添加失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '添加失败', icon: 'none' });
    });
  },

  buyNow: function() {
    const product = this.data.product;
    if (!product) return;
    this.addToCart();
    setTimeout(() => {
      wx.switchTab({ url: '/pages/cart/cart' });
    }, 1000);
  },

  goToCart: function() {
    wx.switchTab({ url: '/pages/cart/cart' });
  }
});
