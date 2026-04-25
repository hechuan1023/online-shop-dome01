const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    banners: [],
    hotKeywords: [],
    cartToastShow: false,
    cartToastMsg: '',
    categories: [
      { id: 1, name: '手机', tag: 'phone', icon: '/images/cat-phone.png' },
      { id: 2, name: '电脑', tag: 'computer', icon: '/images/cat-computer.png' },
      { id: 3, name: '耳机', tag: 'earphone', icon: '/images/cat-earphone.png' },
      { id: 4, name: '家电', tag: 'appliance', icon: '/images/cat-appliance.png' }
    ],
    products: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    this.loadBanners();
    this.loadHotKeywords();
    this.loadProducts();
  },

  onPullDownRefresh: function() {
    this.setData({ page: 1, products: [], hasMore: true });
    this.loadBanners();
    this.loadProducts();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts();
    }
  },

  loadBanners: function() {
    request({ url: '/banner', showLoading: false }).then(res => {
      if (res.status === 200) {
        const banners = (res.data.result || []).map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));
        this.setData({ banners });
        banners.forEach((item, index) => {
          wx.getImageInfo({
            src: item.image,
            success: (imgRes) => {
              this.setData({ ['banners[' + index + '].localImage']: imgRes.path });
            }
          });
        });
      }
    }).catch(() => {});
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
