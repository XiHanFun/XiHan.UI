/**
 * 返回上一页
 * @returns 返回上一页
 */
export const back = () => {
  window.history.back();
};

/**
 * 前进下一页
 * @returns 前进下一页
 */
export const forward = () => {
  window.history.forward();
};

/**
 * 跳转到指定页面
 * @param delta 前进或后退的页面数量
 */
export const go = (delta: number) => {
  window.history.go(delta);
};

/**
 * 添加历史记录
 * @param url 要添加的URL
 * @param state 可选参数，表示要添加的状态对象
 */
export const push = (url: string, state?: any) => {
  window.history.pushState(state, "", url);
};

/**
 * 删除当前历史记录
 */
export const remove = () => {
  window.history.go(-1);
};

/**
 * 替换当前历史记录
 * @param url 要替换的URL
 * @param state 可选参数，表示要替换的状态对象
 */
export const replace = (url: string, state?: any) => {
  window.history.replaceState(state, "", url);
};
