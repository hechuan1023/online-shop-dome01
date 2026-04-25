const app = getApp();

Page({
  data: {},

  onLoad: function(options) {
    this.redirectUrl = options.redirect || '/pages/index/index';
  },

  wechatLogin: function() {
    wx.showLoading({ title: '登录中...', mask: true });

    const mockCode = 'mock_code_' + Date.now();
    const loginUrl = app.globalData.baseUrl + '/login';

    console.log('[登录] 请求地址:', loginUrl);
    console.log('[登录] 请求数据:', { code: mockCode });

    wx.request({
      url: loginUrl,
      method: 'POST',
      data: { code: mockCode },
      success: (response) => {
        wx.hideLoading();
        console.log('[登录] 响应状态码:', response.statusCode);
        console.log('[登录] 响应数据:', JSON.stringify(response.data));

        if (response.data && response.data.status === 200) {
          const data = response.data.data;
          const mockUserInfo = {
            nickName: '微信用户',
            avatarUrl: '/images/default-avatar.png',
            openid: data.openid,
            token: data.token
          };
          app.globalData.userInfo = mockUserInfo;
          app.globalData.openid = data.openid;
          app.globalData.token = data.token;
          app.globalData.isLoggedIn = true;
          wx.setStorageSync('userInfo', mockUserInfo);
          wx.setStorageSync('openid', data.openid);
          wx.setStorageSync('token', data.token);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 800);
        } else {
          const msg = response.data ? response.data.msg : '未知错误';
          console.log('[登录] 失败原因:', msg);
          wx.showToast({ title: msg, icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('[登录] 请求失败:', JSON.stringify(err));
        wx.showToast({ title: '网络错误，请检查后端服务', icon: 'none' });
      }
    });
  }
});
