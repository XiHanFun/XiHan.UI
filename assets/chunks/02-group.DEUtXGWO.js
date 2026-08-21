const n=`<!-- 分组 | 分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去 -->
<xh-toolbar style="inline-size: 100%">
  <div data-xh-part="root">
    <button
      type="button"
      data-xh-part="item"
      value="undo"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      撤销
    </button>
    <button
      type="button"
      data-xh-part="item"
      value="redo"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      重做
    </button>
    <div data-xh-part="separator"></div>
    <div data-xh-part="group">
      <button
        type="button"
        data-xh-part="item"
        value="align-left"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        左对齐
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="align-center"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        居中
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="align-right"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        右对齐
      </button>
    </div>
  </div>
</xh-toolbar>
`;export{n as default};
