const app = getApp();
const request = require('../../util/request');

Page({
  data: {
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile')
  },

  onLoad: function(options) {
    this.redirectUrl = options.redirect || '/pages/index/index';
  },

  // 第一步：微信登录，获取 code 换 token
  wechatLogin: function() {
    var that = this;
    wx.showLoading({ title: '登录中...', mask: true });

    wx.login({
      success: function(loginRes) {
        if (!loginRes.code) {
          wx.hideLoading();
          wx.showToast({ title: '获取登录码失败', icon: 'none' });
          return;
        }

        console.log('[登录] wx.login code:', loginRes.code);

        // 发送 code 到后端换取 openid 和 token
        request({
          url: '/login',
          method: 'POST',
          data: { code: loginRes.code }
        }).then(function(res) {
          wx.hideLoading();
          console.log('[登录] 服务器响应:', JSON.stringify(res));

          if (res.status === 200 && res.data) {
            var data = res.data;
            // 保存登录态
            app.globalData.openid = data.openid;
            app.globalData.token = data.token;
            wx.setStorageSync('user_openid', data.openid);
            wx.setStorageSync('user_token', data.token);

            // 显示授权按钮，让用户获取头像昵称
            that.setData({ hasUserInfo: true });
          } else {
            wx.showToast({ title: res.msg || '登录失败', icon: 'none' });
          }
        }).catch(function(err) {
          wx.hideLoading();
          console.log('[登录] 请求失败:', JSON.stringify(err));
          wx.showToast({ title: '网络错误', icon: 'none' });
        });
      },
      fail: function(err) {
        wx.hideLoading();
        console.log('[登录] wx.login 失败:', JSON.stringify(err));
        wx.showToast({ title: '微信登录失败', icon: 'none' });
      }
    });
  },

  // 第二步：授权获取头像昵称
  getUserProfile: function() {
    var that = this;
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: function(res) {
        console.log('[授权] 获取用户信息成功:', res);
        var userInfo = {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl
        };
        app.globalData.userInfo = userInfo;
        app.globalData.isLoggedIn = true;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(function() { wx.navigateBack(); }, 800);
      },
      fail: function(err) {
        console.log('[授权] 用户拒绝授权:', err);
        // 用户拒绝授权，仍然完成登录（用默认信息）
        var userInfo = {
          nickName: '微信用户',
          avatarUrl: '/images/default-avatar.png'
        };
        app.globalData.userInfo = userInfo;
        app.globalData.isLoggedIn = true;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(function() { wx.navigateBack(); }, 800);
      }
    });
  }
});
