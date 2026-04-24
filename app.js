App({
  globalData: {
    baseUrl: 'http://localhost:3001/api',
    serverUrl: 'http://localhost:3001',
    userInfo: null,
    openid: null,
    token: null
  },

  onLaunch: function() {
    this.checkLogin();
  },

  checkLogin: function() {
    const token = wx.getStorageSync('token');
    const openid = wx.getStorageSync('openid');
    if (token && openid) {
      this.globalData.token = token;
      this.globalData.openid = openid;
    }
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
