const request = require('../../util/request');

Page({
  data: {
    id: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    is_default: false,
    region: []
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      this.loadAddress(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' });
    }
  },

  loadAddress: function(id) {
    request({ url: '/address/list' }).then(res => {
      if (res.status === 200) {
        const addr = res.data.find(a => a.id == id);
        if (addr) {
          this.setData({
            name: addr.name,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            detail: addr.detail,
            is_default: !!addr.is_default,
            region: [addr.province, addr.city, addr.district]
          });
        }
      }
    });
  },

  onInput: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onRegionChange: function(e) {
    this.setData({
      region: e.detail.value,
      province: e.detail.value[0],
      city: e.detail.value[1],
      district: e.detail.value[2]
    });
  },

  toggleDefault: function() {
    this.setData({ is_default: !this.data.is_default });
  },

  saveAddress: function() {
    const { name, phone, province, city, district, detail, is_default, id } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!phone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    if (!province) {
      wx.showToast({ title: '请选择地区', icon: 'none' });
      return;
    }
    if (!detail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return;
    }

    const data = { name, phone, province, city, district, detail, is_default };
    const url = id ? '/address/update' : '/address/add';
    if (id) data.id = id;

    request({
      url: url,
      method: 'POST',
      data: data
    }).then(res => {
      if (res.status === 200) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
      } else {
        wx.showToast({ title: res.msg || '保存失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  }
});
