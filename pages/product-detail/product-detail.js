const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    product: null,
    productId: null,
    loading: true,
    reviews: [],
    cartCount: 0,
    isFavorite: false
  },

  onLoad: function (options) {
    const id = options.id;
    this.setData({ productId: id });
    this.loadProductDetail(id);
    this.loadReviews(id);
    this.loadCartCount();
    this.checkFavorite(id);
  },

  onShow: function () {
    this.loadCartCount();
  },

  onShareAppMessage: function () {
    const product = this.data.product;
    return {
      title: product ? product.title : '商品详情',
      path: '/pages/product-detail/product-detail?id=' + this.data.productId
    };
  },

  loadProductDetail: function (id) {
    this.setData({ loading: true });
    request({
      url: '/buy',
      data: { id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const product = {
          ...res.data[0],
          images: [],
          image: res.data[0].image.startsWith('http') ? res.data[0].image : app.globalData.serverUrl + res.data[0].image
        };
        this.setData({ product });
        this.loadProductImages(id, product);
      } else {
        wx.showToast({ title: '商品不存在', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  loadProductImages: function (id, product) {
    request({
      url: '/goods/images',
      data: { goods_id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const images = res.data.map(img => ({
          ...img,
          image: img.image.startsWith('http') ? img.image : app.globalData.serverUrl + img.image
        }));
        product.images = images;
        this.setData({ product });
        images.forEach((img, i) => {
          wx.getImageInfo({
            src: img.image,
            success: (imgRes) => {
              const key = 'product.images[' + i + '].localImage';
              this.setData({ [key]: imgRes.path });
            }
          });
        });
      } else {
        product.images = [{ id: 0, image: product.image, localImage: product.localImage }];
        this.setData({ product });
      }
    }).catch(() => {
      product.images = [{ id: 0, image: product.image, localImage: product.localImage }];
      this.setData({ product });
    });
  },

  loadReviews: function (id) {
    request({
      url: '/goods/reviews',
      data: { goods_id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        this.setData({ reviews: res.data || [] });
      }
    }).catch(() => { });
  },

  loadCartCount: function () {
    request({
      url: '/cart/list',
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        const items = res.data || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        this.setData({ cartCount: count });
      }
    }).catch(() => { });
  },

  previewImage: function (e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.product.images.map(img => img.image);
    wx.previewImage({
      current: url,
      urls: urls.length > 0 ? urls : [this.data.product.image]
    });
  },

  addToCart: function () {
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
        wx.showToast({ title: res.msg === '数量+1' ? '购物车数量+1' : '已加入购物车', icon: 'success' });
        this.loadCartCount();
      }
    }).catch(() => {
      wx.showToast({ title: '添加失败', icon: 'none' });
    });
  },

  buyNow: function () {
    const product = this.data.product;
    if (!product) return;
    this.addToCart();
    setTimeout(() => {
      wx.switchTab({ url: '/pages/cart/cart' });
    }, 1000);
  },

  goToCart: function () {
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  goToHome: function () {
    wx.switchTab({ url: '/pages/index/index' });
  },

  contactService: function () {
    wx.navigateTo({ url: '/pages/customer-service/customer-service' });
  },

  checkFavorite: function (goodsId) {
    request({
      url: '/favorite/check',
      data: { goods_id: goodsId },
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        this.setData({ isFavorite: res.data.isFavorite });
      }
    }).catch(() => { });
  },

  toggleFavorite: function () {
    if (this.data.isFavorite) {
      this.removeFavorite();
    } else {
      this.addFavorite();
    }
  },

  addFavorite: function () {
    request({
      url: '/favorite/add',
      method: 'POST',
      data: { goods_id: this.data.productId },
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        this.setData({ isFavorite: true });
        wx.showToast({ title: '收藏成功', icon: 'success' });
      }
    }).catch(() => {
      wx.showToast({ title: '收藏失败', icon: 'none' });
    });
  },

  removeFavorite: function () {
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/favorite/remove',
            method: 'POST',
            data: { goods_id: this.data.productId },
            showLoading: false
          }).then(() => {
            this.setData({ isFavorite: false });
            wx.showToast({ title: '已取消收藏', icon: 'success' });
          }).catch(() => {
            wx.showToast({ title: '取消失败', icon: 'none' });
          });
        }
      }
    });
  }
});
