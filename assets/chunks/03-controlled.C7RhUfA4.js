const t=`<!-- 受控 | 传了 sider-collapsed 就由宿主说了算，组件不再自改，只发 sider-collapsed-change -->
<div style="display: grid; gap: 12px">
  <xh-button size="sm">
    <button data-xh-part="root" id="layout-controlled-toggle">从外面收起</button>
  </xh-button>

  <xh-layout id="layout-controlled" sider-collapsed="false" bordered>
    <div
      data-xh-part="root"
      style="block-size: 220px; border-radius: 8px; overflow: hidden"
    >
      <div data-xh-part="header">
        <button data-xh-part="sider-trigger">切换</button>
        <span id="layout-controlled-state">当前：已展开</span>
      </div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">把手与上面那个按钮改的是同一份状态。</div>
    </div>
  </xh-layout>
</div>

<script type="module">
  // 折叠态由这份脚本持有：把手与外部按钮都改它，改完写回元素
  const layout = document.getElementById("layout-controlled");
  const toggle = document.getElementById("layout-controlled-toggle");
  const state = document.getElementById("layout-controlled-state");

  function apply(collapsed) {
    layout.siderCollapsed = collapsed;
    toggle.textContent = collapsed ? "从外面展开" : "从外面收起";
    state.textContent = collapsed ? "当前：已折叠" : "当前：已展开";
  }

  layout.addEventListener("sider-collapsed-change", (event) => {
    apply(event.detail.collapsed);
  });
  toggle.addEventListener("click", () => {
    apply(!layout.siderCollapsed);
  });
<\/script>
`;export{t as default};
