const a=`<!-- 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一块触发区，逐块右键对比 -->
<!-- 三块触发区共用一份外观，尺寸差别只由 size 造成 -->
<div
  style="
    inline-size: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  "
>
  <xh-context-menu size="sm">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 96px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>sm</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu>
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 96px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>缺省</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu size="lg">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 96px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>lg</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
</div>
`;export{a as default};
