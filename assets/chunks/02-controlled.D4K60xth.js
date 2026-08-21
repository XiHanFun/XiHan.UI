const n=`<!-- 受控 | 传了 open 就由宿主说了算，组件自己不再改状态，只发 open-change 报告意图 -->
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-button size="sm">
    <button data-xh-part="root" id="collapsible-controlled-toggle">
      从外面展开
    </button>
  </xh-button>

  <xh-collapsible id="collapsible-controlled" open="false">
    <div data-xh-part="root">
      <button data-xh-part="trigger">面板标题</button>
      <div data-xh-part="content">
        当前状态：<span id="collapsible-controlled-state">收起</span
        >。触发器与上面的按钮改的是同一份状态。
      </div>
    </div>
  </xh-collapsible>
</div>

<script type="module">
  // 开合状态存在宿主这一侧，两处入口都改它，组件只按 open 显示
  const collapsible = document.getElementById("collapsible-controlled");
  const toggle = document.getElementById("collapsible-controlled-toggle");
  const state = document.getElementById("collapsible-controlled-state");

  function render(open) {
    collapsible.open = open;
    toggle.textContent = open ? "从外面收起" : "从外面展开";
    state.textContent = open ? "展开" : "收起";
  }

  toggle.addEventListener("click", () => render(!collapsible.open));
  collapsible.addEventListener("open-change", (event) =>
    render(event.detail.open),
  );
<\/script>
`;export{n as default};
