const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    addressList: [],
    loading: false,
    selectMode: false
  },

  onLoad: function(options) {
    if (options.select === '1') {
      this.setData({ selectMode: true });
    }
  },

  onShow: function() {
    if (!app.requireLogin()) return;
    this.loadAddressList();
  },

  loadAddressList: function() {
    this.setData({ loading: true });
    request({ url: '/address/list', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ addressList: res.data || [] });
      }
    }).catch(() => {}).finally(() => {
      this.setData({ loading: false });
    });
  },

  addAddress: function() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  editAddress: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/address-edit/address-edit?id=' + id });
  },

  deleteAddress: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/address/delete',
            method: 'POST',
            data: { id: id }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadAddressList();
            }
          });
        }
      }
    });
  },

  setDefault: function(e) {
    const id = e.currentTarget.dataset.id;
    request({
      url: '/address/default',
      method: 'POST',
      data: { id: id }
    }).then(res => {
      if (res.status === 200) {
        wx.showToast({ title: '已设置', icon: 'success' });
        this.loadAddressList();
      }
    });
  },

  selectAddress: function(e) {
    if (!this.data.selectMode) return;
    const id = e.currentTarget.dataset.id;
    const address = this.data.addressList.find(a => a.id === id);
    if (address) {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.setData({ selectedAddress: address });
      }
      wx.navigateBack();
    }
  }
});
