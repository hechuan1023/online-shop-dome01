const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    product: null,
    productId: null,
    loading: true,
    reviews: []
  },

  onLoad: function(options) {
    const id = options.id;
    this.setData({ productId: id });
    this.loadProductDetail(id);
    this.loadReviews(id);
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
    // 获取商品基本信息
    request({
      url: '/buy',
      data: { id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const product = {
          ...res.data[0],
          images: [],  // 先初始化，后面填充
          image: res.data[0].image.startsWith('http') ? res.data[0].image : app.globalData.serverUrl + res.data[0].image
        };
        this.setData({ product });
        // 加载多图
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

  loadProductImages: function(id, product) {
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
        // 预加载图片
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
        // 没有多图，用主图兜底
        product.images = [{ id: 0, image: product.image, localImage: product.localImage }];
        this.setData({ product });
      }
    }).catch(() => {
      product.images = [{ id: 0, image: product.image, localImage: product.localImage }];
      this.setData({ product });
    });
  },

  loadReviews: function(id) {
    request({
      url: '/goods/reviews',
      data: { goods_id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        this.setData({ reviews: res.data || [] });
      }
    }).catch(() => {});
  },

  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.product.images.map(img => img.image);
    wx.previewImage({
      current: url,
      urls: urls.length > 0 ? urls : [this.data.product.image]
    });
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
        wx.showToast({ title: res.msg === '数量+1' ? '购物车数量+1' : '已加入购物车', icon: 'success' });
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
