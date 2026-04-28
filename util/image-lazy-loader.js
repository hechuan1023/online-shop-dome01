const app = getApp();

class ImageLazyLoader {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 5;
    this.placeholder = options.placeholder || '/public/images/default-product.png';
    this.cache = new Map();
    this.queue = [];
    this.running = 0;
  }

  loadOne(src, successCb, failCb) {
    if (!src) {
      if (failCb) failCb();
      return;
    }
    if (this.cache.has(src)) {
      const cached = this.cache.get(src);
      if (successCb) successCb(cached);
      return;
    }
    this.addToQueue(src, successCb, failCb);
    this.processQueue();
  }

  loadMany(srcList) {
    srcList.forEach((item) => {
      this.loadOne(item.src, item.success, item.fail);
    });
  }

  addToQueue(src, successCb, failCb) {
    this.queue.push({ src, successCb, failCb });
  }

  processQueue() {
    if (this.queue.length === 0 || this.running >= this.maxConcurrent) return;

    const task = this.queue.shift();
    this.running++;

    wx.getImageInfo({
      src: task.src,
      success: (res) => {
        this.cache.set(task.src, res.path);
        if (task.successCb) task.successCb(res);
      },
      fail: (err) => {
        if (task.failCb) task.failCb(err);
      },
      complete: () => {
        this.running--;
        this.processQueue();
      }
    });
  }

  preloadRange(items, visibleStart, visibleEnd, imageKey, resultKey) {
    const start = Math.max(0, visibleStart - 5);
    const end = Math.min(items.length - 1, visibleEnd + 5);
    const tasks = [];

    for (let i = start; i <= end; i++) {
      const item = items[i];
      if (!item) continue;
      const src = item[imageKey] || this.placeholder;
      const key = resultKey || 'localImage';
      if (item[key] || this.cache.has(src)) continue;

      const page = this;
      const index = i;
      tasks.push({
        src,
        success: (res) => {
          const updateKey = `goodsList[${index}].${key}`;
          page.setData({ [updateKey]: res.path });
        }
      });
    }

    this.loadMany(tasks);
  }

  clear() {
    this.queue = [];
    this.cache.clear();
    this.running = 0;
  }

  getCacheSize() {
    return this.cache.size;
  }
}

module.exports = ImageLazyLoader;
