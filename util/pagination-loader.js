const app = getApp();

class PaginationLoader {
  constructor(options = {}) {
    this.pageSize = options.pageSize || 10;
    this.page = 1;
    this.hasMore = true;
    this.loading = false;
    this.requestFn = options.requestFn;
    this.onSuccess = options.onSuccess;
    this.onFail = options.onFail;
    this.dataKey = options.dataKey || 'result';
    this.extractData = options.extractData || ((res) => res.data[this.dataKey] || []);
    this.checkMore = options.checkMore || ((data) => data.length >= this.pageSize);
  }

  reset() {
    this.page = 1;
    this.hasMore = true;
    this.loading = false;
  }

  load(isRefresh = false) {
    if (this.loading) return Promise.resolve({ data: [], hasMore: false });
    if (!this.hasMore && !isRefresh) return Promise.resolve({ data: [], hasMore: false });

    if (isRefresh) {
      this.reset();
    }

    this.loading = true;
    const currentPage = this.page;

    if (typeof this.requestFn !== 'function') {
      console.error('[PaginationLoader] requestFn is not defined');
      this.loading = false;
      return Promise.reject(new Error('requestFn is not defined'));
    }

    return this.requestFn(currentPage, this.pageSize)
      .then((res) => {
        const newData = this.extractData(res);
        this.hasMore = this.checkMore(newData);
        this.page = currentPage + 1;

        if (typeof this.onSuccess === 'function') {
          this.onSuccess(newData, isRefresh);
        }

        return { data: newData, hasMore: this.hasMore, page: currentPage };
      })
      .catch((err) => {
        this.hasMore = false;
        if (typeof this.onFail === 'function') {
          this.onFail(err);
        }
        throw err;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getState() {
    return {
      page: this.page,
      hasMore: this.hasMore,
      loading: this.loading
    };
  }

  forceSetHasMore(value) {
    this.hasMore = value;
  }
}

module.exports = PaginationLoader;
