const request = require('../../util/request');
const app = getApp();

Page({
  data: {
    keyword: '',
    hotKeywords: [],
    searchHistory: [],
    products: [],
    searched: false,
    loading: false
  },

  onLoad: function() {
    this.loadHotKeywords();
    this.loadSearchHistory();
  },

  loadHotKeywords: function() {
    request({ url: '/keywords', showLoading: false }).then(res => {
      if (res.status === 200) {
        this.setData({ hotKeywords: res.data.result || [] });
      }
    }).catch(() => {});
  },

  loadSearchHistory: function() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history });
  },

  onInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;
    this.saveSearchHistory(keyword);
    this.doSearch(keyword);
  },

  onKeywordTap: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword });
    this.saveSearchHistory(keyword);
    this.doSearch(keyword);
  },

  onHistoryTap: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword });
    this.doSearch(keyword);
  },

  doSearch: function(keyword) {
    this.setData({ loading: true, searched: true });
    request({
      url: '/goods/search',
      data: { search: keyword }
    }).then(res => {
      if (res.status === 200) {
        const products = res.data.map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));
        this.setData({ products });
        products.forEach((item, index) => {
          wx.getImageInfo({
            src: item.image,
            success: (imgRes) => {
              this.setData({ ['products[' + index + '].localImage']: imgRes.path });
            }
          });
        });
      } else {
        this.setData({ products: [] });
      }
    }).catch(() => {
      this.setData({ products: [] });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  saveSearchHistory: function(keyword) {
    let history = wx.getStorageSync('searchHistory') || [];
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    if (history.length > 10) history = history.slice(0, 10);
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },

  clearHistory: function() {
    wx.removeStorageSync('searchHistory');
    this.setData({ searchHistory: [] });
  },

  goToProductDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/product-detail?id=' + id
    });
  },

  onClear: function() {
    this.setData({ keyword: '', products: [], searched: false });
  }
});
