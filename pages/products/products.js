const request = require('../../util/request');

Page({
  data: {
    products: [],
    page: 1,
    hasMore: true,
    loading: false,
    keyword: ''
  },

  onLoad: function() {
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

  loadProducts: function() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    request({
      url: '/goods',
      data: { page: this.data.page }
    }).then(res => {
      if (res.status === 200) {
        const newProducts = res.data.result || [];
        this.setData({
          products: this.data.products.concat(newProducts),
          page: this.data.page + 1,
          hasMore: newProducts.length >= 10
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

  onInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      this.setData({ page: 1, products: [], hasMore: true });
      this.loadProducts();
      return;
    }
    this.setData({ loading: true, products: [], hasMore: false });
    request({
      url: '/goods/search',
      data: { search: keyword }
    }).then(res => {
      if (res.status === 200) {
        this.setData({ products: res.data });
      } else {
        this.setData({ products: [] });
      }
    }).catch(() => {
      this.setData({ products: [] });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  onClear: function() {
    this.setData({ keyword: '', page: 1, products: [], hasMore: true });
    this.loadProducts();
  },

  onProductTap: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/product-detail/product-detail?id=' + id });
  }
});
