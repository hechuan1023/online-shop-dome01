const request = require('../../util/request');
const app = getApp();

// 分类图标使用网络URL（管理后台仅在开发者工具中使用，不受HTTPS限制）
const CATEGORY_ICONS = {
  phone: 'https://118.31.108.147/images/category/phone.png',
  computer: 'https://118.31.108.147/images/category/computer.png',
  earphone: 'https://118.31.108.147/images/category/earphone.png',
  appliance: 'https://118.31.108.147/images/category/appliance.png',
  clothing: 'https://118.31.108.147/images/category/clothing.png',
  food: 'https://118.31.108.147/images/category/food.png',
  camera: 'https://118.31.108.147/images/category/camera.png'
};

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
      { tag: 'phone', name: '手机', icon: CATEGORY_ICONS.phone },
      { tag: 'computer', name: '电脑', icon: CATEGORY_ICONS.computer },
      { tag: 'earphone', name: '耳机', icon: CATEGORY_ICONS.earphone },
      { tag: 'appliance', name: '家电', icon: CATEGORY_ICONS.appliance },
      { tag: 'clothing', name: '服饰', icon: CATEGORY_ICONS.clothing },
      { tag: 'food', name: '食品', icon: CATEGORY_ICONS.food },
      { tag: 'camera', name: '相机', icon: CATEGORY_ICONS.camera }
    ],
    categoryIndex: -1,
    showCategoryPicker: false,
    uploading: false,
    saving: false,
    // 商品多图（轮播图）
    detailImages: [],
    // 商品详情图文内容 [{type: 'text', value: '...'}, {type: 'image', value: 'url'}]
    detailContent: []
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
            categoryIndex: catIndex
          });
          // 加载多图
          this.loadGoodsImages(id);
          // 加载图文详情
          this.loadGoodsDetailContent(id);
        }
      }
    }).catch(() => {
      wx.hideLoading();
    });
  },

  // ========== 主图操作 ==========

  chooseMainImage: function() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.uploadImage(tempFilePath, 'main');
      }
    });
  },

  removeMainImage: function() {
    this.setData({ 'form.image': '' });
  },

  onMainImageInput: function(e) {
    this.setData({ 'form.image': e.detail.value });
  },

  previewMainImage: function() {
    if (this.data.form.image) {
      wx.previewImage({ urls: [this.data.form.image] });
    }
  },

  // ========== 多图（轮播图）操作 ==========

  chooseDetailImages: function() {
    const that = this;
    const remainCount = 9 - this.data.detailImages.length;
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        const currentLength = that.data.detailImages.length;
        const newImages = that.data.detailImages.slice();
        res.tempFiles.forEach((file, i) => {
          const tempId = Date.now() + i;
          newImages.push({ id: tempId, url: file.tempFilePath, uploading: true });
        });
        that.setData({ detailImages: newImages });
        // 逐张上传，index 基于选择前的长度计算
        res.tempFiles.forEach((file, i) => {
          const index = currentLength + i;
          that.uploadImage(file.tempFilePath, 'detail', index);
        });
      }
    });
  },

  removeDetailImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const detailImages = this.data.detailImages.slice();
    detailImages.splice(index, 1);
    this.setData({ detailImages });
  },

  previewDetailImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.detailImages.map(img => img.url);
    wx.previewImage({ urls, current: this.data.detailImages[index].url });
  },

  // ========== 图文详情操作 ==========

  addDetailText: function() {
    const detailContent = this.data.detailContent.slice();
    detailContent.push({ id: Date.now(), type: 'text', value: '' });
    this.setData({ detailContent });
  },

  addDetailImage: function() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        const detailContent = that.data.detailContent.slice();
        const contentId = Date.now();
        detailContent.push({ id: contentId, type: 'image', value: tempFilePath, uploading: true });
        that.setData({ detailContent });
        that.uploadImage(tempFilePath, 'content', detailContent.length - 1);
      }
    });
  },

  onDetailTextInput: function(e) {
    const index = e.currentTarget.dataset.index;
    const key = 'detailContent[' + index + '].value';
    this.setData({ [key]: e.detail.value });
  },

  previewContentImage: function(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({ urls: [this.data.detailContent[index].value] });
  },

  removeContent: function(e) {
    const index = e.currentTarget.dataset.index;
    const detailContent = this.data.detailContent.slice();
    detailContent.splice(index, 1);
    this.setData({ detailContent });
  },

  moveContentUp: function(e) {
    const index = e.currentTarget.dataset.index;
    if (index <= 0) return;
    const detailContent = this.data.detailContent.slice();
    const temp = detailContent[index];
    detailContent[index] = detailContent[index - 1];
    detailContent[index - 1] = temp;
    this.setData({ detailContent });
  },

  moveContentDown: function(e) {
    const index = e.currentTarget.dataset.index;
    const detailContent = this.data.detailContent.slice();
    if (index >= detailContent.length - 1) return;
    const temp = detailContent[index];
    detailContent[index] = detailContent[index + 1];
    detailContent[index + 1] = temp;
    this.setData({ detailContent });
  },

  // ========== 通用上传 ==========

  uploadImage: function(filePath, type, index) {
    const that = this;
    wx.uploadFile({
      url: app.globalData.baseUrl + '/admin/goods/upload',
      filePath: filePath,
      name: 'file',
      header: { 'token': app.globalData.token || '' },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.status === 200) {
            const fullUrl = data.data.url.startsWith('http') ? data.data.url : app.globalData.serverUrl + data.data.url;
            if (type === 'main') {
              that.setData({ 'form.image': fullUrl });
            } else if (type === 'detail') {
              const key = 'detailImages[' + index + '].url';
              const uploadingKey = 'detailImages[' + index + '].uploading';
              that.setData({ [key]: fullUrl, [uploadingKey]: false });
            } else if (type === 'content') {
              const key = 'detailContent[' + index + '].value';
              const uploadingKey = 'detailContent[' + index + '].uploading';
              that.setData({ [key]: fullUrl, [uploadingKey]: false });
            }
          } else {
            wx.showToast({ title: data.msg || '上传失败', icon: 'none' });
            that.clearUploadingFlag(type, index);
          }
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' });
          that.clearUploadingFlag(type, index);
        }
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
        that.clearUploadingFlag(type, index);
      }
    });
  },

  // 清除上传失败时的 uploading 标志
  clearUploadingFlag: function(type, index) {
    if (type === 'detail') {
      const key = 'detailImages[' + index + '].uploading';
      this.setData({ [key]: false });
    } else if (type === 'content') {
      const key = 'detailContent[' + index + '].uploading';
      this.setData({ [key]: false });
    }
  },

  // ========== 加载已有数据 ==========

  loadGoodsImages: function(id) {
    request({
      url: '/goods/images',
      data: { goods_id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const images = res.data.map(img => ({
          id: img.id,
          url: img.image.startsWith('http') ? img.image : app.globalData.serverUrl + img.image,
          uploading: false
        }));
        this.setData({ detailImages: images });
      }
    }).catch(() => {});
  },

  loadGoodsDetailContent: function(id) {
    request({
      url: '/goods/detail-content',
      data: { goods_id: id },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data.length > 0) {
        const content = res.data.map(item => ({
          id: item.id,
          type: item.type,
          value: item.type === 'image' ? (item.value.startsWith('http') ? item.value : app.globalData.serverUrl + item.value) : item.value
        }));
        this.setData({ detailContent: content });
      }
    }).catch(() => {});
  },

  // ========== 表单操作 ==========

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

  // ========== 保存商品 ==========

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

    // 检查图片是否还在上传中
    const uploadingDetail = this.data.detailImages.some(img => img.uploading);
    const uploadingContent = this.data.detailContent.some(item => item.uploading);
    if (uploadingDetail || uploadingContent) {
      wx.showToast({ title: '图片上传中，请稍候...', icon: 'none' });
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
      category: form.category || '',
      // 多图URL列表
      detailImages: this.data.detailImages.map(img => img.url),
      // 图文详情
      detailContent: this.data.detailContent.map(item => ({
        type: item.type,
        value: item.value
      }))
    };

    const url = this.data.isEdit ? '/admin/goods/update' : '/admin/goods/add';

    if (this.data.isEdit) {
      saveData.id = this.data.goodsId;
    }

    request({
      url: url,
      method: 'POST',
      data: saveData
    }).then(res => {
      wx.hideLoading();
      if (res.status === 200) {
        wx.showToast({ title: this.data.isEdit ? '修改成功' : '添加成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        wx.showToast({ title: res.msg || '保存失败', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }).finally(() => {
      this.setData({ saving: false });
    });
  }
});
