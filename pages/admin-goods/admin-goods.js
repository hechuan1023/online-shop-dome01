const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    products: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPage: 0,
    loading: false,
    keyword: '',
    showEditDialog: false,
    editForm: {
      id: '',
      title: '',
      price: '',
      image: '',
      description: '',
      stock: ''
    },
    isEditing: false,
    uploading: false
  },

  onLoad: function() {
    this.loadProducts();
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

  // 搜索
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

  // 添加商品
  goToAdd: function() {
    wx.navigateTo({ url: '/pages/admin-goods-edit/admin-goods-edit' });
  },

  // 编辑商品
  goToEdit: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/admin-goods-edit/admin-goods-edit?id=' + id });
  },

  // 删除商品
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

  // 图片预览
  previewImage: function(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({ urls: [src] });
  }
});
