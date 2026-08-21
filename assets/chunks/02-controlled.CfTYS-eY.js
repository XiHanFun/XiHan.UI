const n=`<!-- 受控 | 传了 open 就由宿主说了算，组件只发 open-change 不自己改展开态 -->
<div style="inline-size: 100%; display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
  <!-- 外部按钮直接改 open，菜单照样展开 -->
  <button type="button" id="menu-controlled-toggle">从外面展开</button>

  <xh-menu id="menu-controlled" open="false">
    <button data-xh-part="trigger">操作</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="item" value="duplicate">创建副本</div>
      </div>
    </div>
  </xh-menu>

  <span>当前：<span id="menu-controlled-state">收起</span></span>
</div>

<script type="module">
  // 展开态由这段脚本持有：组件只发意图，写回 open 才真的展开
  const menu = document.getElementById("menu-controlled");
  const toggle = document.getElementById("menu-controlled-toggle");
  const readout = document.getElementById("menu-controlled-state");

  function apply(open) {
    menu.open = open;
    toggle.textContent = open ? "从外面收起" : "从外面展开";
    readout.textContent = open ? "展开" : "收起";
  }

  toggle.addEventListener("click", () => apply(!menu.open));
  menu.addEventListener("open-change", (event) => apply(event.detail.open));
<\/script>
`;export{n as default};
