Page({
  data: {
    cartItems: [],
    allChecked: false,
    totalPrice: 0,
    checkedCount: 0
  },

  onLoad: function(options) {
    this.loadCartData();
  },

  onShow: function() {
    this.loadCartData();
  },

  loadCartData: function() {
    // 模拟购物车数据，实际项目中应该从本地存储或服务器获取
    const cartItems = [
      {
        id: 1,
        name: '苹果手机',
        price: 5999,
        quantity: 1,
        image: '/images/phone.jpg',
        checked: true
      },
      {
        id: 2,
        name: '无线耳机',
        price: 299,
        quantity: 2,
        image: '/images/earphone.jpg',
        checked: false
      }
    ];

    this.setData({
      cartItems: cartItems
    });

    this.calculateTotal();
  },

  toggleCheck: function(e) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems;
    const index = cartItems.findIndex(item => item.id === id);

    if (index !== -1) {
      cartItems[index].checked = !cartItems[index].checked;
      this.setData({
        cartItems: cartItems
      });
      this.calculateTotal();
    }
  },

  toggleSelectAll: function() {
    const allChecked = !this.data.allChecked;
    const cartItems = this.data.cartItems.map(item => {
      item.checked = allChecked;
      return item;
    });

    this.setData({
      cartItems: cartItems,
      allChecked: allChecked
    });
    this.calculateTotal();
  },

  changeQuantity: function(e) {
    const id = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;
    const cartItems = this.data.cartItems;
    const index = cartItems.findIndex(item => item.id === id);

    if (index !== -1) {
      if (action === 'increase') {
        cartItems[index].quantity += 1;
      } else if (action === 'decrease' && cartItems[index].quantity > 1) {
        cartItems[index].quantity -= 1;
      }

      this.setData({
        cartItems: cartItems
      });
      this.calculateTotal();
    }
  },

  deleteItem: function(e) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems;
    const newCartItems = cartItems.filter(item => item.id !== id);

    this.setData({
      cartItems: newCartItems
    });
    this.calculateTotal();

    wx.showToast({
      title: '已删除',
      icon: 'success'
    });
  },

  calculateTotal: function() {
    const cartItems = this.data.cartItems;
    let totalPrice = 0;
    let checkedCount = 0;
    let allChecked = true;

    cartItems.forEach(item => {
      if (item.checked) {
        totalPrice += item.price * item.quantity;
        checkedCount += 1;
      } else {
        allChecked = false;
      }
    });

    this.setData({
      totalPrice: totalPrice,
      checkedCount: checkedCount,
      allChecked: cartItems.length > 0 ? allChecked : false
    });
  },

  goShopping: function() {
    wx.switchTab({
      url: '/pages/products/products'
    });
  },

  checkout: function() {
    const checkedItems = this.data.cartItems.filter(item => item.checked);
    if (checkedItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }

    wx.showToast({
      title: '跳转到结算页面',
      icon: 'none'
    });

    // 这里应该跳转到订单确认页面
    console.log('结算商品:', checkedItems);
  }
});