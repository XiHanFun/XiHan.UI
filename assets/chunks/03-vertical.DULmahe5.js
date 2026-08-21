const n=`<!-- 竖排 | orientation 决定方向键收哪一对键（另一轴原样放行给页面），分隔线的朝向恒与主轴垂直 -->
<xh-toolbar orientation="vertical" style="inline-size: 140px">
  <div data-xh-part="root">
    <button
      type="button"
      data-xh-part="item"
      value="zoom-in"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      放大
    </button>
    <button
      type="button"
      data-xh-part="item"
      value="zoom-out"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      缩小
    </button>
    <div data-xh-part="separator"></div>
    <button
      type="button"
      data-xh-part="item"
      value="fit"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      适应画布
    </button>
  </div>
</xh-toolbar>
`;export{n as default};
