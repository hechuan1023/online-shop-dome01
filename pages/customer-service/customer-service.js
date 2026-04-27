const request = require('../../util/request');

Page({
  data: {
    messages: [],
    inputValue: '',
    scrollToView: '',
    sending: false,
    sessionId: ''
  },

  onLoad: function() {
    const sessionId = 'cs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    this.setData({ sessionId });
    this.addMessage('bot', '您好！我是智能客服小美，很高兴为您服务 👋\n\n请问有什么可以帮您的吗？\n\n您可以咨询：\n• 订单查询与物流\n• 退换货政策\n• 商品相关问题\n• 优惠券使用\n• 账户相关问题');
  },

  addMessage: function(type, content) {
    const messages = this.data.messages;
    const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    messages.push({
      id,
      type,
      content,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
    this.setData({ messages, scrollToView: id });
    setTimeout(() => this.scrollToBottom(), 100);
  },

  onInput: function(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onFocus: function(e) {
    setTimeout(() => this.scrollToBottom(), 200);
  },

  // 本地关键词回复
  getLocalReply: function(message) {
    const msg = message.toLowerCase();

    if (msg.includes('物流') || msg.includes('快递') || msg.includes('发货') || msg.includes('配送') || msg.includes('送到') || msg.includes('多久') || msg.includes('什么时候到')) {
      return '📦 关于物流查询：\n\n1. 您可以在"我的订单"中查看订单物流状态\n2. 一般下单后 24-48 小时内发货\n3. 国内快递通常 3-5 天送达\n\n如需查询具体订单物流，请提供订单号，我来帮您查询。';
    }

    if (msg.includes('退') || msg.includes('换') || msg.includes('退款') || msg.includes('退货') || msg.includes('售后')) {
      return '🔄 退换货政策：\n\n• 7天无理由退换货\n• 商品需保持原包装完好\n• 退款将在 3-5 个工作日内原路返回\n\n您可以在"我的订单"中找到对应订单，点击"申请售后"提交退换货申请。';
    }

    if (msg.includes('优惠') || msg.includes('券') || msg.includes('折扣') || msg.includes('活动') || msg.includes('满减')) {
      return '🎫 优惠券使用：\n\n1. 您可以在"我的-优惠券"中查看可用优惠券\n2. 下单时选择可用的优惠券即可自动抵扣\n3. 每张优惠券有使用门槛和有效期\n\n如需领取新优惠券，可以关注首页的优惠活动。';
    }

    if (msg.includes('支付') || msg.includes('付款') || msg.includes('钱') || msg.includes('微信') || msg.includes('支付宝')) {
      return '💳 支付方式：\n\n我们支持以下支付方式：\n• 微信支付\n• 支付宝\n• 银联卡\n\n如果支付遇到问题，请检查网络连接或更换支付方式重试。';
    }

    if (msg.includes('账户') || msg.includes('密码') || msg.includes('登录') || msg.includes('注册') || msg.includes('绑定')) {
      return '👤 账户问题：\n\n• 您可以使用微信一键登录\n• 忘记密码可通过绑定的手机号找回\n• 如需修改个人信息，可在"我的-设置"中操作\n\n如有其他账户问题，请联系人工客服。';
    }

    if (msg.includes('人工') || msg.includes('找人工') || msg.includes('转人工') || msg.includes('真人客服')) {
      return '👨‍💼 如需联系人工客服，您可以通过以下方式：\n\n• 客服热线：400-888-8888\n• 服务时间：9:00 - 21:00\n\n您也可以留下联系方式，我们会尽快安排客服人员与您联系。';
    }

    if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('在吗') || msg.includes('嗨')) {
      return '您好！😊 我在呢，请问有什么可以帮您的吗？';
    }

    if (msg.includes('谢谢') || msg.includes('感谢') || msg.includes('谢了') || msg.includes('多谢')) {
      return '不客气！很高兴能帮到您 😊\n\n如果还有其他问题，随时可以问我哦~';
    }

    return '抱歉，我可能没有完全理解您的问题 🤔\n\n您可以尝试询问以下问题：\n• 订单物流查询\n• 退换货政策\n• 优惠券使用\n• 支付方式\n• 账户问题\n\n或者输入"人工"联系人工客服。';
  },

  sendMessage: function() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.sending) return;

    this.addMessage('user', content);
    this.setData({ inputValue: '', sending: true });

    // 调用后端接口
    request({
      url: '/chat/send',
      method: 'POST',
      data: { message: content, sessionId: this.data.sessionId },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data && res.data.reply) {
        this.addMessage('bot', res.data.reply);
      } else {
        this.addMessage('bot', res.msg || '抱歉，我暂时无法回答这个问题，请稍后再试。');
      }
    }).catch(() => {
      // 网络异常时使用本地关键词回复
      const reply = this.getLocalReply(content);
      this.addMessage('bot', reply);
    }).finally(() => {
      this.setData({ sending: false });
    });
  },

  // 快捷问题点击
  onQuickQuestion: function(e) {
    const question = e.currentTarget.dataset.question;
    if (!question || this.data.sending) return;

    this.addMessage('user', question);
    this.setData({ inputValue: '', sending: true });

    request({
      url: '/chat/send',
      method: 'POST',
      data: { message: question, sessionId: this.data.sessionId },
      showLoading: false
    }).then(res => {
      if (res.status === 200 && res.data && res.data.reply) {
        this.addMessage('bot', res.data.reply);
      } else {
        this.addMessage('bot', res.msg || '抱歉，我暂时无法回答这个问题，请稍后再试。');
      }
    }).catch(() => {
      const reply = this.getLocalReply(question);
      this.addMessage('bot', reply);
    }).finally(() => {
      this.setData({ sending: false });
    });
  },

  scrollToBottom: function() {
    const query = wx.createSelectorQuery();
    query.select('.chat-body').scrollOffset();
    query.exec((res) => {
      if (res && res[0]) {
        wx.pageScrollTo({ scrollTop: res[0].scrollHeight, duration: 200 });
      }
    });
  }
});
