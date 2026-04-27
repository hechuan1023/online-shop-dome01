const request = require('../../util/request');
const app = getApp();

const STATUS_MAP = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '已完成',
  4: '已取消'
};

Page({
  data: {
    order: null,
    order_no: '',
    loading: true
  },

  onLoad: function(options) {
    this.setData({ order_no: options.order_no });
    this.loadOrderDetail();
  },

  loadOrderDetail: function() {
    this.setData({ loading: true });
    request({
      url: '/order/detail',
      data: { order_no: this.data.order_no }
    }).then(res => {
      if (res.status === 200) {
        const order = res.data;
        order.statusText = STATUS_MAP[order.status] || '未知';
        order.items = (order.items || []).map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));
        this.setData({ order: order });
        (order.items || []).forEach((item, index) => {
          wx.getImageInfo({
            src: item.image,
            success: (imgRes) => {
              this.setData({ ['order.items[' + index + '].localImage']: imgRes.path });
            }
          });
        });
      } else {
        wx.showToast({ title: '订单不存在', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  copyOrderNo: function() {
    wx.setClipboardData({
      data: this.data.order_no,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  goToAddress: function() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  cancelOrder: function() {
    wx.showModal({
      title: '提示',
      content: '确定取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/order/cancel',
            method: 'POST',
            data: { order_no: this.data.order_no }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已取消', icon: 'success' });
              this.loadOrderDetail();
            }
          });
        }
      }
    });
  },

  payOrder: function() {
    request({
      url: '/pay/create',
      method: 'POST',
      data: { order_no: this.data.order_no }
    }).then(res => {
      if (res.status === 200) {
        wx.showToast({ title: '支付成功', icon: 'success' });
        this.loadOrderDetail();
      } else {
        wx.showToast({ title: '支付失败', icon: 'none' });
      }
    });
  },

  confirmReceive: function() {
    wx.showModal({
      title: '提示',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/order/confirm',
            method: 'POST',
            data: { order_no: this.data.order_no }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已确认', icon: 'success' });
              this.loadOrderDetail();
            }
          });
        }
      }
    });
  },

  deleteOrder: function() {
    wx.showModal({
      title: '提示',
      content: '确定删除该订单吗？删除后不可恢复。',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/order/delete',
            method: 'POST',
            data: { order_no: this.data.order_no }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已删除', icon: 'success' });
              wx.navigateBack();
            }
          });
        }
      }
    });
  }
});
