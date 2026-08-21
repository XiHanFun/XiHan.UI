const n=`<!-- 基础用法 | 代码原文由宿主给，组件负责数行数、预撑高度并铺记号；语言角标带 aria-hidden，是纯装饰 -->
<!-- complete 表示这个块已闭合，可以放心着色 -->
<xh-code-block
  code="export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}"
  code-lang="typescript"
  complete
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <span data-xh-part="lang-label">typescript</span>
    <pre data-xh-part="pre"><code data-xh-part="code">export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}</code></pre>
  </div>
</xh-code-block>
`;export{n as default};
