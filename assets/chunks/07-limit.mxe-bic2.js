var e=`<!-- 限定选择数 | min / max 约束选中数：选满时没选的项置灰，降到下限时已选的项摘不掉 -->
<xh-checkbox-group id="checkbox-group-limit" default-value="design" min="1" max="2">
  <div data-xh-part="root">
    <span data-xh-part="label">擅长方向（选 1 到 2 项）</span>
    <div data-xh-part="item" value="design">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">设计</span>
    </div>
    <div data-xh-part="item" value="frontend">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">前端</span>
    </div>
    <div data-xh-part="item" value="backend">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">后端</span>
    </div>
    <div data-xh-part="item" value="data">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">数据</span>
    </div>
    <span id="checkbox-group-limit-status">已选 1 项</span>
  </div>
</xh-checkbox-group>

<script type="module">
  const group = document.getElementById("checkbox-group-limit");
  const status = document.getElementById("checkbox-group-limit-status");
  group.addEventListener("value-change", (event) => {
    status.textContent = \`已选 \${event.detail.value.length} 项\${group.atMax ? "，已达上限" : ""}\`;
  });
<\/script>
`;export{e as default};