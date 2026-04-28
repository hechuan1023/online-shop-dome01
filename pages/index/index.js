const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    banners: [
      { id: 1, image: 'http://118.31.108.147/images/banner/1.jpg' },
      { id: 2, image: 'http://118.31.108.147/images/banner/2.png' },
      { id: 3, image: 'http://118.31.108.147/images/banner/3.jpg' },
      { id: 4, image: 'http://118.31.108.147/images/banner/4.jpg' }
    ],
    hotKeywords: [],
    cartToastShow: false,
    cartToastMsg: '',
    categories: [
      { id: 1, name: '手机', tag: 'phone', icon: 'data:image/png;base64,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' },
      { id: 2, name: '电脑', tag: 'computer', icon: 'data:image/png;base64,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' },
      { id: 3, name: '耳机', tag: 'earphone', icon: 'data:image/png;base64,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' },
      { id: 4, name: '家电', tag: 'appliance', icon: 'data:image/png;base64,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' },
    ],
    products: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    this.cacheBannerImages();
    this.cacheCategoryIcons();
    this.loadHotKeywords();
    this.loadProducts();
  },

  onPullDownRefresh: function() {
    this.setData({ page: 1, products: [], hasMore: true });
    this.loadProducts();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts();
    }
  },

  cacheCategoryIcons: function() {
    const categories = this.data.categories;
    categories.forEach((item, index) => {
      wx.getImageInfo({
        src: item.icon,
        success: (imgRes) => {
          this.setData({ ['categories[' + index + '].localIcon']: imgRes.path });
        }
      });
    });
  },

  cacheBannerImages: function() {
    const banners = this.data.banners;
    banners.forEach((item, index) => {
      wx.getImageInfo({
        src: item.image,
        success: (imgRes) => {
          this.setData({ ['banners[' + index + '].localImage']: imgRes.path });
        }
      });
    });
  },

  loadHotKeywords: function() {
    request({ url: '/keywords', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ hotKeywords: res.data.result || [] });
      }
    }).catch(() => {});
  },

  loadProducts: function() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    request({
      url: '/goods',
      data: { page: this.data.page }
    }).then(res => {
      if (res.status === 200) {
        const newProducts = (res.data.result || []).map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));
        const startIndex = this.data.products.length;
        this.setData({
          products: this.data.products.concat(newProducts),
          page: this.data.page + 1,
          hasMore: newProducts.length >= 10
        });
        newProducts.forEach((item, i) => {
          wx.getImageInfo({
            src: item.image,
            success: (imgRes) => {
              this.setData({ ['products[' + (startIndex + i) + '].localImage']: imgRes.path });
            }
          });
        });
      } else {
        this.setData({ hasMore: false });
      }
    }).catch(() => {
      this.setData({ hasMore: false });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goToSearch: function() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  goToCategory: function(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.switchTab({ url: '/pages/category/category' });
  },

  goToProductDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/product-detail/product-detail?id=' + id });
  },

  addToCart: function(e) {
    const item = e.currentTarget.dataset.item;
    request({
      url: '/cart/add',
      method: 'POST',
      data: {
        title: item.title,
        price: item.price,
        image: item.image,
        currentID: item.id
      }
    }).then(res => {
      if (res.status === 200) {
        const msg = res.msg === '数量+1' ? '购物车数量 +1' : '已加入购物车';
        this.showCartToast(msg);
      }
    }).catch((err) => {
      console.log('[加购物车] 失败:', JSON.stringify(err));
      this.showCartToast('添加失败');
    });
  },

  showCartToast: function(msg) {
    if (this.cartToastTimer) {
      clearTimeout(this.cartToastTimer);
    }
    this.setData({ cartToastShow: true, cartToastMsg: msg });
    this.cartToastTimer = setTimeout(() => {
      this.setData({ cartToastShow: false });
    }, 2000);
  }
});
