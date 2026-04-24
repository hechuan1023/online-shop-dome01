const app = getApp();

const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, showLoading = true } = options;

    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true });
    }

    wx.request({
      url: app.globalData.baseUrl + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json',
        'token': app.globalData.token || ''
      },
      success: (res) => {
        if (showLoading) wx.hideLoading();
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        if (showLoading) wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
};

module.exports = request;
