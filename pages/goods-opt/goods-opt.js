const request = require('../../util/request');
const PaginationLoader = require('../../util/pagination-loader');
const ImageLazyLoader = require('../../util/image-lazy-loader');
const app = getApp();

Page({
  data: {
    goodsList: [],
    keyword: '',
    loading: false,
    hasMore: true,
    isSearchMode: false
  },

  onLoad() {
    this.paginationLoader = new PaginationLoader({
      pageSize: 15,
      requestFn: (page, pageSize) => {
        return request({
          url: '/goods',
          data: { page, pageSize },
          showLoading: page === 1
        });
      },
      onSuccess: (newData, isRefresh) => {
        const processedData = newData.map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));

        if (isRefresh) {
          this.setData({ goodsList: processedData });
        } else {
          this.setData({
            goodsList: this.data.goodsList.concat(processedData)
          });
        }
      }
    });

    this.imageLoader = new ImageLazyLoader({ maxConcurrent: 3 });

    this.paginationLoader.load();
  },

  onUnload() {
    if (this.imageLoader) {
      this.imageLoader.clear();
    }
  },

  onPullDownRefresh() {
    this.paginationLoader.load(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.paginationLoader.load();
    }
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      this.setData({ isSearchMode: false });
      this.paginationLoader.reset();
      this.paginationLoader.load(true);
      return;
    }

    this.setData({
      isSearchMode: true,
      loading: true
    });

    request({
      url: '/goods/search',
      data: { search: keyword, limit: 50 },
      showLoading: true
    }).then(res => {
      if (res.status === 200) {
        const products = (res.data || []).map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : app.globalData.serverUrl + item.image
        }));

        this.setData({
          goodsList: products.slice(0, 30),
          hasMore: products.length > 30
        });

        this.loadVisibleImages(0, Math.min(10, products.length));
      } else {
        this.setData({ goodsList: [], hasMore: false });
      }
    }).catch(() => {
      this.setData({ goodsList: [], hasMore: false });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  onClear() {
    this.setData({ keyword: '', isSearchMode: false });
    this.paginationLoader.reset();
    this.paginationLoader.load(true);
  },

  onGoodsListScroll(e) {
    const scrollTop = e.detail.scrollTop;
    const itemHeight = 200;
    const bufferSize = 5;
    const total = this.data.goodsList.length;

    const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const visibleEnd = Math.min(total - 1, Math.ceil((scrollTop + 600) / itemHeight) + bufferSize);

    this.loadVisibleImages(visibleStart, visibleEnd);
  },

  loadVisibleImages(start, end) {
    if (!this.imageLoader || !this.data.goodsList.length) return;
    this.imageLoader.preloadRange(this.data.goodsList, start, end, 'image', 'localImage');
  },

  onGoodsItemTap(e) {
    const { item } = e.detail;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${item.id}`
    });
  },

  onGoodsAddToCart(e) {
    const { item } = e.detail;
    request({
      url: '/cart/add',
      method: 'POST',
      data: {
        title: item.title,
        price: item.price,
        image: item.image,
        currentID: item.id
      },
      showLoading: false
    }).then(res => {
      if (res.status === 200) {
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1500
        });
      }
    }).catch(() => {
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    });
  }
});
