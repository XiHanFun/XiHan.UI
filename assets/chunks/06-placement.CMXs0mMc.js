const t=`<!-- 放置位与箭头 | placement 是相对光标那一点的首选位，offset 把浮层从光标推开；arrow 指回那一点 -->
<div style="inline-size: 100%; display: grid; gap: 12px">
  <!-- 缺省是贴着光标的 bottom-start，这里改成落在光标右侧并推开 12px -->
  <xh-context-menu placement="right-start" offset="12">
    <div data-xh-part="root">
      <div data-xh-part="trigger" style="display: grid; place-items: center; min-block-size: 120px">
        <span>在这块区域上右键：菜单落在光标右侧，箭头指回光标</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
          <div data-xh-part="item" value="share">
            <span data-xh-part="item-text">分享</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
        <!-- 箭头挂在 positioner 上，位置由定位引擎回填 -->
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-context-menu>
</div>
`;export{t as default};
