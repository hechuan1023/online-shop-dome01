const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      nickName: '未登录',
      avatarUrl: '/images/default-avatar.png'
    },
    stats: {
      orderCount: 0,
      favoriteCount: 0,
      couponCount: 0,
      points: 0,
      unpaidCount: 0,
      unshipCount: 0,
      shippedCount: 0
    }
  },

  onShow: function() {
    this.loadUserInfo();
    this.loadOrderStats();
  },

  loadUserInfo: function() {
    const isLoggedIn = app.globalData.isLoggedIn;
    if (isLoggedIn) {
      const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
      this.setData({
        isLoggedIn: true,
        userInfo: {
          nickName: userInfo.nickName || '微信用户',
          avatarUrl: userInfo.avatarUrl || '/images/default-avatar.png'
        }
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {
          nickName: '未登录',
          avatarUrl: '/images/default-avatar.png'
        }
      });
    }
  },

  loadOrderStats: function() {
    if (!app.globalData.isLoggedIn) return;

    // 获取待付款订单数
    request({ url: '/order/list?status=0', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ 'stats.unpaidCount': res.data.data ? res.data.data.length : 0 });
      }
    }).catch(() => {});

    // 获取待发货订单数
    request({ url: '/order/list?status=1', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ 'stats.unshipCount': res.data.data ? res.data.data.length : 0 });
      }
    }).catch(() => {});

    // 获取待收货订单数
    request({ url: '/order/list?status=2', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ 'stats.shippedCount': res.data.data ? res.data.data.length : 0 });
      }
    }).catch(() => {});

    // 获取全部订单数
    request({ url: '/order/list', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ 'stats.orderCount': res.data.data ? res.data.data.length : 0 });
      }
    }).catch(() => {});
  },

  goToLogin: function() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null;
          app.globalData.openid = null;
          app.globalData.token = null;
          app.globalData.isLoggedIn = false;
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          wx.removeStorageSync('token');
          this.loadUserInfo();
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  },

  showQRCode: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  switchTab: function(e) {
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({ url: '/pages/order/order?status=' + status });
  },

  goToOrders: function() {
    wx.navigateTo({ url: '/pages/order/order' });
  },

  goToRefund: function() {
    wx.showToast({ title: '退换货功能开发中', icon: 'none' });
  },

  goToAddress: function() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  goToFavorites: function() {
    wx.showToast({ title: '收藏功能开发中', icon: 'none' });
  },

  goToCoupons: function() {
    wx.showToast({ title: '优惠券功能开发中', icon: 'none' });
  },

  goToPoints: function() {
    wx.showToast({ title: '积分商城开发中', icon: 'none' });
  },

  goToSettings: function() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' });
  },

  goToHelp: function() {
    wx.showToast({ title: '帮助中心开发中', icon: 'none' });
  },

  goToAbout: function() {
    wx.showToast({ title: '关于我们开发中', icon: 'none' });
  },

  contactService: function() {
    wx.navigateTo({ url: '/pages/customer-service/customer-service' });
  },

  goToAdminGoods: function() {
    wx.navigateTo({ url: '/pages/admin-goods/admin-goods' });
  }
});
