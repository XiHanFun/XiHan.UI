const t=`<!-- 分组 | 条目分段展示：段落壳与段标题由作者写，条目照旧归到同一份集合，方向键与连打检索跨段贯通 -->
<xh-select id="select-group" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">食材</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <!-- 段标题只是普通节点，不带条目标记，导航与检索都跳过它 -->
          <div role="group" aria-labelledby="select-group-fruit">
            <div
              id="select-group-fruit"
              style="padding: 4px 8px; color: var(--xh-fg-subtle); font-size: 12px"
            >
              水果
            </div>
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
          <div role="group" aria-labelledby="select-group-vegetable">
            <div
              id="select-group-vegetable"
              style="padding: 4px 8px; color: var(--xh-fg-subtle); font-size: 12px"
            >
              蔬菜
            </div>
            <div data-xh-part="item" value="carrot">
              <span data-xh-part="item-text">胡萝卜</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="celery">
              <span data-xh-part="item-text">芹菜</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>当前值：<span id="select-group-value">（未选）</span></p>

<script type="module">
  // 选中值回显在下面那行文字里
  const select = document.getElementById("select-group");
  const readout = document.getElementById("select-group-value");
  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
<\/script>
`;export{t as default};
