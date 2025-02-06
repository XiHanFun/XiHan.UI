/**
 * 历史记录操作相关工具函数
 */
export const history = {
  // 返回上一页
  back() {
    window.history.back();
  },

  // 前进下一页
  forward() {
    window.history.forward();
  },

  // 跳转到指定页面
  go(delta: number) {
    window.history.go(delta);
  },

  // 添加历史记录
  push(url: string, state?: any) {
    window.history.pushState(state, "", url);
  },

  // 替换当前历史记录
  replace(url: string, state?: any) {
    window.history.replaceState(state, "", url);
  },
};
