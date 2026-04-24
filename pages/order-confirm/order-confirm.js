const request = require('../../util/request');

Page({
  data: {
    items: [],
    selectedAddress: null,
    remark: '',
    totalAmount: 0,
    freight: 0,
    payAmount: 0
  },

  onLoad: function(options) {
    if (options.items) {
      try {
        const items = JSON.parse(decodeURIComponent(options.items));
        this.setData({ items: items });
        this.calculateTotal();
        items.forEach((item, index) => {
          wx.getImageInfo({
            src: item.image,
            success: (imgRes) => {
              this.setData({ ['items[' + index + '].localImage']: imgRes.path });
            }
          });
        });
      } catch (e) {
        wx.showToast({ title: '参数错误', icon: 'none' });
      }
    }
  },

  onShow: function() {
    this.loadDefaultAddress();
  },

  loadDefaultAddress: function() {
    request({ url: '/address/list', showLoading: false }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const defaultAddr = res.data.find(a => a.is_default) || res.data[0];
        this.setData({ selectedAddress: defaultAddr });
      }
    }).catch(() => {});
  },

  calculateTotal: function() {
    let totalAmount = 0;
    this.data.items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });
    const freight = totalAmount >= 99 ? 0 : 10;
    this.setData({
      totalAmount: totalAmount,
      freight: freight,
      payAmount: totalAmount + freight
    });
  },

  selectAddress: function() {
    wx.navigateTo({ url: '/pages/address/address?select=1' });
  },

  onRemarkInput: function(e) {
    this.setData({ remark: e.detail.value });
  },

  submitOrder: function() {
    if (!this.data.selectedAddress) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }
    if (this.data.items.length === 0) {
      wx.showToast({ title: '商品为空', icon: 'none' });
      return;
    }

    const items = this.data.items.map(item => ({
      goods_id: item.goods_id || item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      cart_id: item.cart_id
    }));

    request({
      url: '/order/create',
      method: 'POST',
      data: {
        address_id: this.data.selectedAddress.id,
        items: items,
        remark: this.data.remark
      }
    }).then(res => {
      if (res.status === 200) {
        wx.redirectTo({
          url: '/pages/pay-result/pay-result?order_no=' + res.data.order_no + '&status=unpaid'
        });
      } else {
        wx.showToast({ title: res.msg || '创建失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '创建失败', icon: 'none' });
    });
  }
});
