const app = getApp();

Page({
  data: {},

  onLoad: function(options) {
    this.redirectUrl = options.redirect || '/pages/index/index';
  },

  wechatLogin: function() {
    wx.showLoading({ title: '登录中...', mask: true });

    // 第一步：获取微信登录 code
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.hideLoading();
          wx.showToast({ title: '获取登录码失败', icon: 'none' });
          return;
        }

        console.log('[登录] wx.login code:', loginRes.code);
        const loginUrl = app.globalData.baseUrl + '/login';

        // 第二步：用 code 换取 openid 和 token
        wx.request({
          url: loginUrl,
          method: 'POST',
          data: { code: loginRes.code },
          success: (response) => {
            wx.hideLoading();
            console.log('[登录] 响应:', JSON.stringify(response.data));

            if (response.data && response.data.status === 200) {
              const data = response.data.data;

              // 第三步：获取用户信息
              wx.getUserProfile({
                desc: '用于完善用户资料',
                  success: (userRes) => {
                    const userInfo = {
                      nickName: userRes.userInfo.nickName,
                      avatarUrl: userRes.userInfo.avatarUrl,
                      openid: data.openid,
                      token: data.token
                    };
                    app.globalData.userInfo = userInfo;
                    app.globalData.openid = data.openid;
                    app.globalData.token = data.token;
                    app.globalData.isLoggedIn = true;
                    wx.setStorageSync('userInfo', userInfo);
                    wx.setStorageSync('openid', data.openid);
                    wx.setStorageSync('token', data.token);
                    wx.showToast({ title: '登录成功', icon: 'success' });
                    setTimeout(() => { wx.navigateBack(); }, 800);
                  },
                  fail: () => {
                    // 用户拒绝授权，提示需要授权
                    wx.showToast({ title: '需要授权才能登录', icon: 'none' });
                  }
                });
            } else {
              const msg = response.data ? response.data.msg : '登录失败';
              wx.showToast({ title: msg, icon: 'none' });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.log('[登录] 请求失败:', JSON.stringify(err));
            wx.showToast({ title: '网络错误，请检查后端服务', icon: 'none' });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('[登录] wx.login 失败:', JSON.stringify(err));
        wx.showToast({ title: '微信登录失败', icon: 'none' });
      }
    });
  }
});
