const n=`<!-- 行号栏 | 行号是作者摆在代码块旁边的一栏，对齐靠行高与内边距这几个公开变量，行数由原文自己数 -->
<!-- 两栏共用同一组变量，行号才跟代码行严格对齐 -->
<div
  style="
    display: flex;
    inline-size: 100%;
    overflow: hidden;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
    --xh-code-block-line-height: 1.5rem;
    --xh-code-block-p: 12px;
    --xh-code-block-label-py: 4px;
    --xh-code-block-label-font-size: 12px;
  "
>
  <!-- 行号是纯装饰，读屏跳过它，代码原文照常由 code 部件念 -->
  <div
    aria-hidden="true"
    style="
      flex: none;
      padding-block: var(--xh-code-block-p);
      padding-inline: 10px;
      border-inline-end: 1px solid var(--xh-border-default);
      color: var(--xh-fg-subtle);
      font-family: var(--xh-font-family-mono);
      line-height: var(--xh-code-block-line-height);
      text-align: right;
      user-select: none;
    "
  >
    <!-- 与语言角标同高的空位，行号才从代码第一行起算 -->
    <div
      style="
        block-size: calc(
          var(--xh-code-block-label-font-size) + var(--xh-code-block-label-py) * 2
        );
      "
    ></div>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
  </div>

  <xh-code-block
    code="export function sum(list: number[]) {
  // 空数组按 0 算
  return list.reduce((total, n) => total + n, 0)
}"
    code-lang="typescript"
    complete
    style="flex: 1; min-inline-size: 0; --xh-code-block-radius: 0"
  >
    <div data-xh-part="root">
      <span data-xh-part="lang-label">typescript</span>
      <pre data-xh-part="pre"><code data-xh-part="code">export function sum(list: number[]) {
  // 空数组按 0 算
  return list.reduce((total, n) => total + n, 0)
}</code></pre>
    </div>
  </xh-code-block>
</div>
`;export{n as default};
