const a=`<!-- 选择型条目 | CheckboxItem 与 RadioGroup 修改持久设置，切换后菜单保持展开 -->
<xh-menu id="menu-choice">
  <button data-xh-part="trigger">视图设置</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" kind="checkbox" value="wrap">
        <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">自动换行</span>
      </div>
      <div data-xh-part="group" kind="radio" value="density">
        <div data-xh-part="item" kind="radio" value="comfortable">
          <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">宽松</span>
        </div>
        <div data-xh-part="item" kind="radio" value="compact">
          <span data-xh-part="item-indicator"></span><span data-xh-part="item-text">紧凑</span>
        </div>
      </div>
    </div>
  </div>
</xh-menu>

<script type="module">
  const menu = document.getElementById("menu-choice");
  menu.checkboxValue = ["wrap"];
  menu.radioValue = { density: "comfortable" };
  menu.addEventListener("checkbox-value-change", (event) => { menu.checkboxValue = event.detail.value; });
  menu.addEventListener("radio-value-change", (event) => { menu.radioValue = event.detail.value; });
<\/script>
`;export{a as default};
