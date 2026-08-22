const n=`<!-- 关闭前拦截 | 受控时组件不自改状态：Escape、点面板外、按叉都只发一次收起意图，写不写由宿主定 -->
<xh-drawer id="drawer-guard" open="false">
  <div data-xh-part="root">
    <button data-xh-part="trigger">编辑草稿</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">编辑草稿</h2>
        <p data-xh-part="description">
          这里假定草稿一直有未保存的改动，任何一次收起意图都要先问一句。
        </p>
        <p id="drawer-guard-notice" style="margin: 0">
          试试按 Escape、点面板外，或者按右上角的叉。
        </p>
        <div id="drawer-guard-actions" style="display: none; gap: 8px">
          <xh-button id="drawer-guard-keep" variant="outline">
            <button data-xh-part="root">继续编辑</button>
          </xh-button>
          <xh-button id="drawer-guard-discard" variant="solid">
            <button data-xh-part="root">丢弃并关闭</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-guard");
  const notice = document.getElementById("drawer-guard-notice");
  const actions = document.getElementById("drawer-guard-actions");
  const keep = document.getElementById("drawer-guard-keep");
  const discard = document.getElementById("drawer-guard-discard");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  function ask(on) {
    actions.style.display = on ? "flex" : "none";
    notice.textContent = on
      ? "改动还没保存，确定丢掉吗？"
      : "试试按 Escape、点面板外，或者按右上角的叉。";
  }

  // 展开意图照单全收，收起意图先扣下来，等下面那两颗按钮表态
  drawer.addEventListener("open-change", (event) => {
    ask(!event.detail.open);
    if (event.detail.open) {
      drawer.open = true;
    }
  });

  keep.addEventListener("click", () => ask(false));
  discard.addEventListener("click", () => {
    ask(false);
    drawer.open = false;
  });
<\/script>
`;export{n as default};
