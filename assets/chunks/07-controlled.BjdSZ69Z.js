const t=`<!-- 受控 | 传了 open 就由宿主说了算；悬停、聚焦、Escape 都只发意图，最终写不写由外面这份状态决定 -->
<div style="display: flex; align-items: center; gap: 16px">
  <xh-tooltip id="tooltip-controlled" open="false" placement="bottom" open-delay="0">
    <button data-xh-part="trigger">把指针停上来</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        显隐完全跟着 open 走
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-button variant="outline">
    <button data-xh-part="root" id="tooltip-controlled-toggle">展开</button>
  </xh-button>
  <span>最近意图：<span id="tooltip-controlled-log">（还没动过）</span></span>
</div>

<script type="module">
  // 开合由外面这份状态说了算，组件报上来的意图先记一笔再写回去
  const tooltip = document.getElementById("tooltip-controlled");
  const toggle = document.getElementById("tooltip-controlled-toggle");
  const readout = document.getElementById("tooltip-controlled-log");
  let log = [];

  function apply(open) {
    tooltip.open = open;
    toggle.textContent = open ? "收起" : "展开";
  }

  tooltip.addEventListener("open-change", (event) => {
    // 只留最近三条意图
    log = [event.detail.open ? "要展开" : "要收起", ...log].slice(0, 3);
    readout.textContent = log.join(" ← ");
    apply(event.detail.open);
  });
  toggle.addEventListener("click", () => apply(!tooltip.open));
<\/script>
`;export{t as default};
