const a=`<!-- 视图设置 | 右键菜单中的 checkbox 与 radio 切换后保持展开 -->
<xh-context-menu id="context-choice">
  <div data-xh-part="root">
    <div data-xh-part="trigger">右键调整视图</div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" kind="checkbox" value="grid">
          <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">显示网格</span>
        </div>
        <div data-xh-part="group" kind="radio" value="size">
          <span data-xh-part="group-label">图标大小</span>
          <div data-xh-part="item" kind="radio" value="small">
            <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">小图标</span>
          </div>
          <div data-xh-part="item" kind="radio" value="large">
            <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">大图标</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-context-menu>

<script type="module">
  const menu = document.getElementById("context-choice");
  menu.defaultCheckboxValue = ["grid"];
  menu.defaultRadioValue = { size: "small" };
<\/script>
`;export{a as default};
