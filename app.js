App({
  globalData: {
    baseUrl: 'http://localhost:3001/api',
    serverUrl: 'http://localhost:3001',
    userInfo: null,
    openid: null,
    token: null,
    isLoggedIn: false
  },

  onLaunch: function() {
    this.checkLogin();
  },

  checkLogin: function() {
    const token = wx.getStorageSync('token');
    const openid = wx.getStorageSync('openid');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && openid && userInfo) {
      this.globalData.token = token;
      this.globalData.openid = openid;
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
    }
  },

  requireLogin: function() {
    if (!this.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    return true;
  },

  login: function(callback) {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: this.globalData.baseUrl + '/login',
            method: 'POST',
            data: { code: res.code },
            success: (response) => {
              if (response.data.status === 200) {
                const data = response.data.data;
                this.globalData.openid = data.openid;
                this.globalData.token = data.token;
                wx.setStorageSync('openid', data.openid);
                wx.setStorageSync('token', data.token);
                callback && callback(data);
              }
            }
          });
        }
      }
    });
  }
});
