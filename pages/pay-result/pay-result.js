const request = require('../../util/request');

Page({
  data: {
    order_no: '',
    status: '',
    order: null,
    loading: false
  },

  onLoad: function(options) {
    this.setData({
      order_no: options.order_no || '',
      status: options.status || 'success'
    });
    if (options.order_no) {
      this.loadOrderDetail();
    }
  },

  loadOrderDetail: function() {
    this.setData({ loading: true });
    request({
      url: '/order/detail',
      data: { order_no: this.data.order_no }
    }).then(res => {
      if (res.status === 200) {
        this.setData({ order: res.data });
      }
    }).catch(() => {}).finally(() => {
      this.setData({ loading: false });
    });
  },

  payNow: function() {
    request({
      url: '/pay/create',
      method: 'POST',
      data: { order_no: this.data.order_no }
    }).then(res => {
      if (res.status === 200) {
        this.setData({ status: 'success' });
        this.loadOrderDetail();
        wx.showToast({ title: '支付成功', icon: 'success' });
      } else {
        wx.showToast({ title: '支付失败', icon: 'none' });
      }
    });
  },

  goToOrder: function() {
    wx.redirectTo({ url: '/pages/order-detail/order-detail?order_no=' + this.data.order_no });
  },

  goToHome: function() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goToOrders: function() {
    wx.redirectTo({ url: '/pages/order/order' });
  }
});
