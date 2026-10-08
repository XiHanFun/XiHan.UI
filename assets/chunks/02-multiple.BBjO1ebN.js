var e=`<!-- 多选 | Space 切换当前行，Shift + 方向键、Shift + Space 与 Shift + 点击把锚点到那一行的一段并进选中，Ctrl 或 Cmd+A 选择或清空全部可用行 -->
<div data-demo-stack>
  <xh-grid-list id="grid-list-multiple" selection-mode="multiple">
    <div data-xh-part="root">
      <div data-xh-part="row" value="read"><span data-xh-part="row-selection-indicator"></span><div data-xh-part="row-content"><span data-xh-part="row-text">读取</span></div></div>
      <div data-xh-part="row" value="write"><span data-xh-part="row-selection-indicator"></span><div data-xh-part="row-content"><span data-xh-part="row-text">写入</span></div></div>
      <div data-xh-part="row" value="deploy" disabled><span data-xh-part="row-selection-indicator"></span><div data-xh-part="row-content"><span data-xh-part="row-text">发布</span></div></div>
    </div>
  </xh-grid-list>
  <span id="grid-list-multiple-readout" data-label>权限：read</span>
</div>
<script type="module">
  const host = document.getElementById("grid-list-multiple");
  const readout = document.getElementById("grid-list-multiple-readout");
  host.value = ["read"];
  host.addEventListener("value-change", (event) => {
    host.value = event.detail.value;
    readout.textContent = "权限：" + (event.detail.value.join("、") || "无");
  });
<\/script>
`;export{e as default};