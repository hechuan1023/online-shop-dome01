const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    isEdit: false,
    goodsId: '',
    form: {
      title: '',
      price: '',
      image: '',
      description: '',
      stock: '',
      category: ''
    },
    categories: [
      { tag: 'phone', name: '手机', icon: 'https://118.31.108.147/images/category/phone.png' },
      { tag: 'computer', name: '电脑', icon: 'https://118.31.108.147/images/category/computer.png' },
      { tag: 'earphone', name: '耳机', icon: 'https://118.31.108.147/images/category/earphone.png' },
      { tag: 'appliance', name: '家电', icon: 'https://118.31.108.147/images/category/appliance.png' },
      { tag: 'clothing', name: '服饰', icon: 'https://118.31.108.147/images/category/clothing.png' },
      { tag: 'food', name: '食品', icon: 'https://118.31.108.147/images/category/food.png' },
      { tag: 'camera', name: '相机', icon: 'https://118.31.108.147/images/category/camera.png' }
    ],
    categoryIndex: -1,
    showCategoryPicker: false,
    uploading: false,
    saving: false,
    imageUrl: ''
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ isEdit: true, goodsId: options.id });
      this.loadGoods(options.id);
    }
  },

  goBack: function() {
    wx.navigateBack();
  },

  loadGoods: function(id) {
    wx.showLoading({ title: '加载中...' });
    request({
      url: '/admin/goods/list',
      data: { page: 1, pageSize: 100 }
    }).then(res => {
      wx.hideLoading();
      if (res.status === 200) {
        const goods = (res.data.list || []).find(item => item.id == id);
        if (goods) {
          const catIndex = this.data.categories.findIndex(c => c.tag === goods.category);
          this.setData({
            form: {
              title: goods.title || '',
              price: goods.price || '',
              image: goods.image || '',
              description: goods.description || '',
              stock: goods.stock || '',
              category: goods.category || ''
            },
            categoryIndex: catIndex,
            imageUrl: goods.image || ''
          });
        }
      }
    }).catch(() => {
      wx.hideLoading();
    });
  },

  onTitleInput: function(e) {
    this.setData({ 'form.title': e.detail.value });
  },

  onPriceInput: function(e) {
    this.setData({ 'form.price': e.detail.value });
  },

  onDescInput: function(e) {
    this.setData({ 'form.description': e.detail.value });
  },

  onStockInput: function(e) {
    this.setData({ 'form.stock': e.detail.value });
  },

  openCategoryPicker: function() {
    this.setData({ showCategoryPicker: true });
  },

  closeCategoryPicker: function() {
    this.setData({ showCategoryPicker: false });
  },

  selectCategory: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      categoryIndex: index,
      'form.category': this.data.categories[index].tag,
      showCategoryPicker: false
    });
  },

  // 选择图片并上传
  chooseImage: function() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.uploadImage(tempFilePath);
      }
    });
  },

  uploadImage: function(filePath) {
    this.setData({ uploading: true });
    wx.uploadFile({
      url: app.globalData.baseUrl + '/admin/goods/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'token': app.globalData.token || ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.status === 200) {
            const fullUrl = data.data.url.startsWith('http') ? data.data.url : app.globalData.serverUrl + data.data.url;
            this.setData({
              'form.image': fullUrl,
              imageUrl: fullUrl
            });
            wx.showToast({ title: '上传成功', icon: 'success' });
          } else {
            wx.showToast({ title: data.msg || '上传失败', icon: 'none' });
          }
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
      },
      complete: () => {
        this.setData({ uploading: false });
      }
    });
  },

  // 手动输入图片链接
  onImageInput: function(e) {
    const url = e.detail.value;
    this.setData({
      'form.image': url,
      imageUrl: url
    });
  },

  // 删除图片
  removeImage: function() {
    this.setData({
      'form.image': '',
      imageUrl: ''
    });
  },

  // 预览图片
  previewImage: function() {
    if (this.data.imageUrl) {
      wx.previewImage({ urls: [this.data.imageUrl] });
    }
  },

  // 保存商品
  saveGoods: function() {
    const form = this.data.form;

    if (!form.title.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      wx.showToast({ title: '请输入有效价格', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });

    const saveData = {
      title: form.title.trim(),
      price: parseFloat(form.price),
      image: form.image || '',
      description: form.description || '',
      stock: parseInt(form.stock) || 100,
      category: form.category || ''
    };

    if (this.data.isEdit) {
      saveData.id = this.data.goodsId;
      request({
        url: '/admin/goods/update',
        method: 'POST',
        data: saveData
      }).then(res => {
        wx.hideLoading();
        if (res.status === 200) {
          wx.showToast({ title: '修改成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.msg || '修改失败', icon: 'none' });
        }
      }).catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '修改失败', icon: 'none' });
      }).finally(() => {
        this.setData({ saving: false });
      });
    } else {
      request({
        url: '/admin/goods/add',
        method: 'POST',
        data: saveData
      }).then(res => {
        wx.hideLoading();
        if (res.status === 200) {
          wx.showToast({ title: '添加成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.msg || '添加失败', icon: 'none' });
        }
      }).catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '添加失败', icon: 'none' });
      }).finally(() => {
        this.setData({ saving: false });
      });
    }
  }
});
