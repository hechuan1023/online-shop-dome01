const app = getApp();

const getImageUrl = (image) => {
  if (!image) return '/images/default-product.png';
  if (image.startsWith('http')) return image;
  return app.globalData.serverUrl + image;
};

const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, showLoading = true, timeout = 10000 } = options;

    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true });
    }

    wx.request({
      url: app.globalData.baseUrl + url,
      method: method,
      data: data,
      timeout: timeout,
      header: {
        'content-type': 'application/json',
        'token': app.globalData.token || ''
      },
      success: (res) => {
        if (showLoading) wx.hideLoading();
        console.log('[请求成功]', url, '状态码:', res.statusCode, '数据:', JSON.stringify(res.data));
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({ msg: '请求失败', statusCode: res.statusCode, data: res.data });
        }
      },
      fail: (err) => {
        if (showLoading) wx.hideLoading();
        console.log('[请求失败]', url, JSON.stringify(err));
        reject({ msg: '网络错误', err: err });
      }
    });
  });
};

module.exports = request;
module.exports.getImageUrl = getImageUrl;
