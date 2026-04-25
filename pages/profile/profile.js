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
      points: 0
    }
  },

  onShow: function() {
    this.loadUserInfo();
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

  editProfile: function() {
    wx.showToast({
      title: '跳转到编辑页面',
      icon: 'none'
    });
    // 这里应该跳转到编辑个人信息页面
  },

  goToOrders: function() {
    wx.navigateTo({ url: '/pages/order/order' });
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

  goToSettings: function() {
    wx.showToast({
      title: '跳转到设置页面',
      icon: 'none'
    });
    // 这里应该跳转到设置页面
  },

  goToHelp: function() {
    wx.showToast({
      title: '跳转到帮助页面',
      icon: 'none'
    });
    // 这里应该跳转到帮助页面
  },

  goToAbout: function() {
    wx.showToast({
      title: '跳转到关于页面',
      icon: 'none'
    });
    // 这里应该跳转到关于页面
  }
});