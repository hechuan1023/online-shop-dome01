const request = require('../../util/request');
const app = getApp();

const ADMIN_PASSWORD = '1234';

Page({
  data: {
    products: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPage: 0,
    loading: false,
    keyword: '',
    isAuthenticated: false,
    showPasswordDialog: false,
    passwordInput: '',
    passwordError: ''
  },

  onLoad: function() {
    this.checkAuth();
  },

  onShow: function() {
    if (this.data.isAuthenticated) {
      this.setData({ page: 1, products: [] });
      this.loadProducts();
    }
  },

  checkAuth: function() {
    const auth = wx.getStorageSync('adminAuth');
    if (auth) {
      this.setData({ isAuthenticated: true });
      this.loadProducts();
    } else {
      this.setData({ showPasswordDialog: true });
    }
  },

  onPasswordInput: function(e) {
    this.setData({ passwordInput: e.detail.value, passwordError: '' });
  },

  submitPassword: function() {
    if (this.data.passwordInput === ADMIN_PASSWORD) {
      wx.setStorageSync('adminAuth', true);
      this.setData({
        isAuthenticated: true,
        showPasswordDialog: false,
        passwordInput: '',
        passwordError: ''
      });
      this.loadProducts();
    } else {
      this.setData({ passwordError: '密码错误，请重试' });
    }
  },

  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定退出管理后台吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminAuth');
          this.setData({ isAuthenticated: false, showPasswordDialog: true, products: [] });
        }
      }
    });
  },

  onPullDownRefresh: function() {
    this.setData({ page: 1, products: [] });
    this.loadProducts().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom: function() {
    if (this.data.page < this.data.totalPage && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadProducts();
    }
  },

  loadProducts: function() {
    if (this.data.loading) return Promise.resolve();
    this.setData({ loading: true });
    return request({
      url: '/admin/goods/list',
      data: { page: this.data.page, pageSize: this.data.pageSize }
    }).then(res => {
      if (res.status === 200) {
        const list = res.data.list || [];
        const products = this.data.page === 1 ? list : this.data.products.concat(list);
        this.setData({
          products: products,
          total: res.data.total,
          totalPage: res.data.totalPage
        });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  onSearchInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      this.setData({ page: 1, products: [] });
      this.loadProducts();
      return;
    }
    this.setData({ loading: true });
    request({
      url: '/goods/search',
      data: { search: keyword }
    }).then(res => {
      if (res.status === 200) {
        this.setData({ products: res.data || [], total: res.data.length, totalPage: 1 });
      } else {
        this.setData({ products: [], total: 0 });
      }
    }).catch(() => {
      this.setData({ products: [] });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goToAdd: function() {
    wx.navigateTo({ url: '/pages/admin-goods-edit/admin-goods-edit' });
  },

  goToEdit: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/admin-goods-edit/admin-goods-edit?id=' + id });
  },

  deleteProduct: function(e) {
    const id = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title;
    wx.showModal({
      title: '确认删除',
      content: '确定删除商品「' + title + '」吗？删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/admin/goods/delete',
            method: 'POST',
            data: { id: id }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.setData({ page: 1, products: [] });
              this.loadProducts();
            } else {
              wx.showToast({ title: res.msg || '删除失败', icon: 'none' });
            }
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  previewImage: function(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({ urls: [src] });
  }
});
