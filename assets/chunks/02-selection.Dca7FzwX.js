const a=`<!-- 可选中 | selectionMode 决定点一枚是替换还是加选；Ctrl/Cmd + A 全选 -->
<xh-tag-group
  id="tag-group-selection"
  selection-mode="multiple"
  value="design"
  variant="outline"
  tone="brand"
>
  <div data-xh-part="root">
    <span data-xh-part="label">话题</span>
    <div data-xh-part="list">
      <span data-xh-part="item" value="design">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">设计</span>
        </span>
      </span>
      <span data-xh-part="item" value="a11y">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">无障碍</span>
        </span>
      </span>
      <span data-xh-part="item" value="motion">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">动效</span>
        </span>
      </span>
      <span data-xh-part="item" value="legacy" aria-disabled="true">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">已归档</span>
        </span>
      </span>
    </div>
  </div>
</xh-tag-group>
<p>已选：<span id="tag-group-selection-value">design</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const group = document.getElementById("tag-group-selection");
  const readout = document.getElementById("tag-group-selection-value");
  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};
