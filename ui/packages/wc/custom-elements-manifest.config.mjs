// Custom Elements Manifest 生成配置。
// 元素经 defineElement 自定义注册（非 customElements.define/@customElement），
// 且基类是 ReactiveElement，故标签名/属性/事件由源码 JSDoc（@customElement/@attr/@fires/@csspart）声明。
export default {
  globs: ['src/elements/*.ts'],
  outdir: '.',
  litelement: true,
  packagejson: false,
}
