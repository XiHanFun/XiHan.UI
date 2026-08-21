const a=`<!-- 语气 | tone 决定条目高亮用哪族颜色；静止态看不出来，展开后悬停条目、或用方向键把焦点移上去才显现 -->
<!-- 六个各自独立的菜单，逐个展开对比条目高亮底色 -->
<div style="display: flex; flex-wrap: wrap; gap: 8px">
  <xh-menu tone="brand">
    <button data-xh-part="trigger">brand</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="neutral">
    <button data-xh-part="trigger">neutral</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="success">
    <button data-xh-part="trigger">success</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="warning">
    <button data-xh-part="trigger">warning</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="danger">
    <button data-xh-part="trigger">danger</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="info">
    <button data-xh-part="trigger">info</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
</div>
`;export{a as default};
