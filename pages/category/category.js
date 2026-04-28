const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    categories: [
      { id: 1, name: '手机', tag: 'phone', icon: 'http://118.31.108.147/images/category/phone.jpg' },
      { id: 2, name: '电脑', tag: 'computer', icon: 'http://118.31.108.147/images/category/computer.jpg' },
      { id: 3, name: '耳机', tag: 'earphone', icon: 'http://118.31.108.147/images/category/earphone.jpg' },
      { id: 4, name: '家电', tag: 'appliance', icon: 'http://118.31.108.147/images/category/appliance.jpg' },
      { id: 5, name: '服饰', tag: 'clothing', icon: 'http://118.31.108.147/images/category/clothing.jpg' },
      { id: 6, name: '食品', tag: 'food', icon: 'http://118.31.108.147/images/category/food.jpg' },
      { id: 7, name: '相机', tag: 'camera', icon: 'http://118.31.108.147/images/category/camera.jpg' }
    ],
    currentCategory: 'phone',
    products: [],
    loading: false
  },

  onLoad: function() {
    this.cacheCategoryIcons();
    this.loadCategoryProducts('phone');
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
