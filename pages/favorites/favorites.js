const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    favorites: [],
    loading: false,
    empty: false,
    editMode: false,
    selectedItems: []
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  onPullDownRefresh() {
    this.loadFavorites();
    wx.stopPullDownRefresh();
  },

  loadFavorites() {
    this.setData({ loading: true });
    request({
      url: '/favorite/list',
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        const favorites = (res.data || []).map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image,
          selected: false
        }));
        this.setData({
          favorites,
          empty: favorites.length === 0
        });
      } else {
        this.setData({ favorites: [], empty: true });
      }
    }).catch(() => {
      this.setData({ favorites: [], empty: true });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  toggleEditMode() {
    this.setData({ editMode: !this.data.editMode });
  },

  toggleSelectItem(e) {
    const index = e.currentTarget.dataset.index;
    const key = `favorites[${index}].selected`;
    this.setData({ [key]: !this.data.favorites[index].selected });
  },

  selectAll() {
    const favorites = this.data.favorites.map(item => ({ ...item, selected: true }));
    this.setData({ favorites });
  },

  deselectAll() {
    const favorites = this.data.favorites.map(item => ({ ...item, selected: false }));
    this.setData({ favorites });
  },

  batchRemove() {
    const selectedItems = this.data.favorites.filter(item => item.selected);
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请选择要删除的收藏', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提示',
      content: `确定要取消 ${selectedItems.length} 件商品的收藏吗？`,
      success: (res) => {
        if (res.confirm) {
          this.removeItems(selectedItems.map(item => item.goods_id));
        }
      }
    });
  },

  removeItem(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          this.removeItems([goodsId]);
        }
      }
    });
  },

  removeItems(goodsIds) {
    wx.showLoading({ title: '删除中...', mask: true });
    let removed = 0;
    goodsIds.forEach(goodsId => {
      request({
        url: '/favorite/remove',
        method: 'POST',
        data: { goods_id: goodsId },
        showLoading: false
      }).then(() => {
        removed++;
        if (removed === goodsIds.length) {
          wx.hideLoading();
          wx.showToast({ title: '已取消收藏', icon: 'success' });
          this.loadFavorites();
        }
      }).catch(() => {
        removed++;
        if (removed === goodsIds.length) {
          wx.hideLoading();
          this.loadFavorites();
        }
      });
    });
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  }
});