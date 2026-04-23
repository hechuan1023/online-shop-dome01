Page({
  data: {
    userInfo: {
      nickName: '微信用户',
      avatarUrl: '/images/default-avatar.png',
      level: 'VIP会员'
    },
    stats: {
      orderCount: 12,
      favoriteCount: 8,
      couponCount: 3,
      points: 1580
    }
  },

  onLoad: function(options) {
    this.loadUserInfo();
  },

  onShow: function() {
    this.loadUserInfo();
  },

  loadUserInfo: function() {
    // 实际项目中应该从本地存储或服务器获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {
      nickName: '微信用户',
      avatarUrl: '/images/default-avatar.png',
      level: 'VIP会员'
    };

    this.setData({
      userInfo: userInfo
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
    wx.showToast({
      title: '跳转到订单页面',
      icon: 'none'
    });
    // 这里应该跳转到订单页面
  },

  goToAddress: function() {
    wx.showToast({
      title: '跳转到地址管理',
      icon: 'none'
    });
    // 这里应该跳转到地址管理页面
  },

  goToFavorites: function() {
    wx.showToast({
      title: '跳转到收藏页面',
      icon: 'none'
    });
    // 这里应该跳转到收藏页面
  },

  goToCoupons: function() {
    wx.showToast({
      title: '跳转到优惠券页面',
      icon: 'none'
    });
    // 这里应该跳转到优惠券页面
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