const app = getApp();

Page({
  data: {},

  onLoad: function(options) {
    this.redirectUrl = options.redirect || '/pages/index/index';
  },

  wechatLogin: function() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const userInfo = profileRes.userInfo;
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              wx.request({
                url: app.globalData.baseUrl + '/login',
                method: 'POST',
                data: { code: loginRes.code },
                success: (response) => {
                  if (response.data.status === 200) {
                    const data = response.data.data;
                    const fullUserInfo = {
                      ...userInfo,
                      openid: data.openid,
                      token: data.token
                    };
                    app.globalData.userInfo = fullUserInfo;
                    app.globalData.openid = data.openid;
                    app.globalData.token = data.token;
                    app.globalData.isLoggedIn = true;
                    wx.setStorageSync('userInfo', fullUserInfo);
                    wx.setStorageSync('openid', data.openid);
                    wx.setStorageSync('token', data.token);
                    wx.showToast({ title: '登录成功', icon: 'success' });
                    setTimeout(() => {
                      wx.navigateBack();
                    }, 1000);
                  } else {
                    wx.showToast({ title: '登录失败', icon: 'none' });
                  }
                },
                fail: () => {
                  wx.showToast({ title: '网络错误', icon: 'none' });
                }
              });
            }
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '已取消授权', icon: 'none' });
      }
    });
  }
});
