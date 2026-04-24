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
    tabs: [
      { key: '', name: '全部' },
      { key: '0', name: '待付款' },
      { key: '1', name: '待发货' },
      { key: '2', name: '待收货' },
      { key: '3', name: '已完成' }
    ],
    currentTab: '',
    orders: [],
    loading: false
  },

  onLoad: function(options) {
    if (options.status !== undefined) {
      this.setData({ currentTab: options.status });
    }
  },

  onShow: function() {
    this.loadOrders();
  },

  switchTab: function(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentTab: key });
    this.loadOrders();
  },

  loadOrders: function() {
    this.setData({ loading: true });
    request({
      url: '/order/list',
      data: { status: this.data.currentTab }
    }).then(res => {
      if (res.status === 200) {
        const orders = (res.data || []).map(order => ({
          ...order,
          statusText: STATUS_MAP[order.status] || '未知',
          items: (order.items || []).map(item => ({
            ...item,
            image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
          }))
        }));
        this.setData({ orders: orders });
        orders.forEach((order, orderIdx) => {
          (order.items || []).forEach((item, itemIdx) => {
            wx.getImageInfo({
              src: item.image,
              success: (imgRes) => {
                this.setData({ ['orders[' + orderIdx + '].items[' + itemIdx + '].localImage']: imgRes.path });
              }
            });
          });
        });
      } else {
        this.setData({ orders: [] });
      }
    }).catch(() => {
      this.setData({ orders: [] });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goToDetail: function(e) {
    const order_no = e.currentTarget.dataset.no;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?order_no=' + order_no });
  },

  cancelOrder: function(e) {
    const order_no = e.currentTarget.dataset.no;
    wx.showModal({
      title: '提示',
      content: '确定取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/order/cancel',
            method: 'POST',
            data: { order_no: order_no }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已取消', icon: 'success' });
              this.loadOrders();
            }
          });
        }
      }
    });
  },

  payOrder: function(e) {
    const order_no = e.currentTarget.dataset.no;
    request({
      url: '/pay/create',
      method: 'POST',
      data: { order_no: order_no }
    }).then(res => {
      if (res.status === 200) {
        wx.showToast({ title: '支付成功', icon: 'success' });
        this.loadOrders();
      } else {
        wx.showToast({ title: '支付失败', icon: 'none' });
      }
    });
  },

  confirmReceive: function(e) {
    const order_no = e.currentTarget.dataset.no;
    wx.showModal({
      title: '提示',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/order/confirm',
            method: 'POST',
            data: { order_no: order_no }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已确认', icon: 'success' });
              this.loadOrders();
            }
          });
        }
      }
    });
  }
});
