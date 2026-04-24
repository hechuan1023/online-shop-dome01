const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    categories: [
      { id: 1, name: '手机', tag: 'phone', icon: '/images/cat-phone.png' },
      { id: 2, name: '电脑', tag: 'computer', icon: '/images/cat-computer.png' },
      { id: 3, name: '耳机', tag: 'earphone', icon: '/images/cat-earphone.png' },
      { id: 4, name: '家电', tag: 'appliance', icon: '/images/cat-appliance.png' },
      { id: 5, name: '服饰', tag: 'clothing', icon: '/images/cat-clothing.png' },
      { id: 6, name: '食品', tag: 'food', icon: '/images/cat-food.png' }
    ],
    currentCategory: 'phone',
    products: [],
    loading: false
  },

  onLoad: function() {
    this.loadCategoryProducts('phone');
  },

  switchCategory: function(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({ currentCategory: tag });
    this.loadCategoryProducts(tag);
  },

  loadCategoryProducts: function(tag) {
    this.setData({ loading: true });
    request({
      url: '/category',
      data: { tag: tag }
    }).then(res => {
      if (res.status === 200) {
        const products = res.data.map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));
        this.setData({ products });
        products.forEach((item, index) => {
          wx.getImageInfo({
            src: item.image,
            success: (imgRes) => {
              this.setData({ ['products[' + index + '].localImage']: imgRes.path });
            }
          });
        });
      } else {
        this.setData({ products: [] });
      }
    }).catch(() => {
      this.setData({ products: [] });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goToProductDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/product-detail?id=' + id
    });
  },

  goToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  }
});
