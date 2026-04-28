const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    cartItems: [],
    allChecked: false,
    totalPrice: 0,
    checkedCount: 0,
    loading: false
  },

  onShow: function() {
    this.loadCartData();
  },

  loadCartData: function() {
    this.setData({ loading: true });
    request({
      url: '/cart',
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        const items = (res.data || []).map(item => ({
          ...item,
          checked: true,
          quantity: item.quantity || 1,
          image: item.image ? (item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image) : '/images/default-product.png'
        }));
        this.setData({ cartItems: items });
        this.loadImages(items);
      } else {
        this.setData({ cartItems: [] });
      }
    }).catch(() => {
      this.setData({ cartItems: [] });
    }).finally(() => {
      this.setData({ loading: false });
      this.calculateTotal();
    });
  },

  loadImages: function(items) {
    items.forEach((item, index) => {
      wx.getImageInfo({
        src: item.image,
        success: (res) => {
          const key = 'cartItems[' + index + '].localImage';
          this.setData({ [key]: res.path });
        }
      });
    });
  },

  toggleCheck: function(e) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems;
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
      cartItems[index].checked = !cartItems[index].checked;
      this.setData({ cartItems: cartItems });
      this.calculateTotal();
    }
  },

  toggleSelectAll: function() {
    const allChecked = !this.data.allChecked;
    const cartItems = this.data.cartItems.map(item => {
      item.checked = allChecked;
      return item;
    });
    this.setData({ cartItems: cartItems, allChecked: allChecked });
    this.calculateTotal();
  },

  changeQuantity: function(e) {
    const id = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;
    const cartItems = this.data.cartItems;
    const index = cartItems.findIndex(item => item.id === id);
    if (index === -1) return;

    let newQty = cartItems[index].quantity;
    if (action === 'increase') {
      newQty += 1;
    } else if (action === 'decrease') {
      if (newQty <= 1) {
        wx.showToast({ title: '数量不能少于1', icon: 'none', duration: 1000 });
        return;
      }
      newQty -= 1;
    }

    // 先更新本地
    cartItems[index].quantity = newQty;
    this.setData({ cartItems: cartItems });
    this.calculateTotal();

    // 同步到后端
    request({
      url: '/cart/update',
      method: 'POST',
      data: { id: id, quantity: newQty },
      showLoading: false
    }).catch(() => {
      wx.showToast({ title: '更新失败', icon: 'none' });
    });
  },

  deleteItem: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/cart/del',
            method: 'POST',
            data: { id: id }
          }).then(res => {
            if (res.status === 200) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadCartData();
            } else {
              wx.showToast({ title: res.msg || '删除失败', icon: 'none' });
            }
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  calculateTotal: function() {
    const cartItems = this.data.cartItems;
    let totalPrice = 0;
    let checkedCount = 0;
    let allChecked = true;
    cartItems.forEach(item => {
      if (item.checked) {
        totalPrice += item.price * 100 * item.quantity;
        checkedCount += 1;
      } else {
        allChecked = false;
      }
    });
    totalPrice = totalPrice / 100
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      checkedCount: checkedCount,
      allChecked: cartItems.length > 0 ? allChecked : false
    });
  },

  goShopping: function() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  checkout: function() {
    if (!app.requireLogin()) return;
    const checkedItems = this.data.cartItems.filter(item => item.checked);
    if (checkedItems.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    const items = checkedItems.map(item => ({
      goods_id: item.currentID || item.id,
      cart_id: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity || 1
    }));
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm?items=' + encodeURIComponent(JSON.stringify(items))
    });
  }
});
