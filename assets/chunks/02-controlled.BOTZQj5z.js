const n=`<!-- 受控 | value 是当前展开的那一项，null 表示都收起；给了它就由宿主说了算 -->
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menubar id="menubar-controlled">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="file">文件</button>
      <button data-xh-part="trigger" value="help">帮助</button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="save">
            <span data-xh-part="item-text">保存</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="help">
        <div data-xh-part="content" value="help">
          <div data-xh-part="item" value="about">
            <span data-xh-part="item-text">关于</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>

  <div
    id="menubar-controlled-actions"
    style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"
  >
    <button type="button" data-open="file">展开「文件」</button>
    <button type="button" data-open="help">展开「帮助」</button>
    <button type="button" data-open="">全部收起</button>
    <span>当前：<span id="menubar-controlled-state">（都收起）</span></span>
  </div>
</div>

<script type="module">
  // 展开项由这段脚本持有：组件只发意图，写回 value 才真的展开
  const menubar = document.getElementById("menubar-controlled");
  const readout = document.getElementById("menubar-controlled-state");

  function apply(value) {
    menubar.value = value;
    readout.textContent = value ?? "（都收起）";
  }

  apply(null);

  const actions = document.getElementById("menubar-controlled-actions");
  for (const button of actions.querySelectorAll("[data-open]")) {
    button.addEventListener("click", () => apply(button.dataset.open || null));
  }
  menubar.addEventListener("value-change", (event) => apply(event.detail.value));
<\/script>
`;export{n as default};
