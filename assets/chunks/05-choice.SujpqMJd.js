const a=`<!-- 菜单栏设置 | checkbox 与 radio 的值独立于当前展开菜单 -->
<xh-menubar id="menubar-choice">
  <div data-xh-part="root">
    <button data-xh-part="trigger" value="view">视图</button>
    <div data-xh-part="positioner" value="view">
      <div data-xh-part="content" value="view">
        <div data-xh-part="item" kind="checkbox" value="status">
          <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">状态栏</span>
        </div>
        <div data-xh-part="group" kind="radio" value="density">
          <span data-xh-part="group-label">密度</span>
          <div data-xh-part="item" kind="radio" value="comfortable">
            <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">宽松</span>
          </div>
          <div data-xh-part="item" kind="radio" value="compact">
            <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">紧凑</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-menubar>

<script type="module">
  const bar = document.getElementById("menubar-choice");
  bar.defaultCheckboxValue = ["status"];
  bar.defaultRadioValue = { density: "comfortable" };
<\/script>
`;export{a as default};
