const ImageLazyLoader = require('../../util/image-lazy-loader');

Component({
  properties: {
    goodsList: {
      type: Array,
      value: [],
      observer: 'onDataChange'
    },
    itemHeight: {
      type: Number,
      value: 200
    },
    bufferSize: {
      type: Number,
      value: 5
    },
    imageKey: {
      type: String,
      value: 'localImage'
    },
    srcKey: {
      type: String,
      value: 'image'
    },
    showActions: {
      type: Boolean,
      value: false
    }
  },

  data: {
    visibleStart: 0,
    visibleEnd: 0,
    totalHeight: 0,
    scrollTop: 0,
    renderedItems: []
  },

  lifetimes: {
    attached() {
      this.imageLoader = new ImageLazyLoader({ maxConcurrent: 5 });
    },
    detached() {
      if (this.imageLoader) {
        this.imageLoader.clear();
      }
    }
  },

  methods: {
    onDataChange() {
      const totalHeight = this.data.goodsList.length * this.data.itemHeight;
      this.setData({ totalHeight });
      this.updateVisibleRange();
    },

    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.setData({ scrollTop });
      this.updateVisibleRange();
    },

    updateVisibleRange() {
      const { goodsList, itemHeight, bufferSize } = this.data;
      const total = goodsList.length;
      if (total === 0) return;

      const viewportHeight = this.data.viewportHeight || 600;
      const scrollTop = this.data.scrollTop;

      const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
      const visibleEnd = Math.min(total - 1, Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize);

      if (visibleStart !== this.data.visibleStart || visibleEnd !== this.data.visibleEnd) {
        this.setData({ visibleStart, visibleEnd });
        this.loadVisibleImages(visibleStart, visibleEnd);
      }
    },

    loadVisibleImages(start, end) {
      const { goodsList, srcKey, imageKey } = this.data;
      if (!this.imageLoader) return;

      this.imageLoader.preloadRange(goodsList, start, end, srcKey, imageKey);
    },

    onItemTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.goodsList[index];
      this.triggerEvent('itemtap', { item, index });
    },

    onAddToCart(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.goodsList[index];
      this.triggerEvent('addtocart', { item, index });
    }
  }
});
