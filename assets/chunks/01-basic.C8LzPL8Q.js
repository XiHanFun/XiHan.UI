var e=`<!-- 单选与行内操作 | 点击行只改变选择，行内按钮执行自己的动作 -->
<div data-demo-stack>
  <xh-grid-list id="grid-list-basic">
    <div data-xh-part="root">
      <span data-xh-part="label">项目</span>
      <div data-xh-part="row" value="docs">
        <span data-xh-part="row-selection-indicator"></span>
        <div data-xh-part="row-content"><span data-xh-part="row-text">文档站</span><span data-xh-part="row-description">组件文档与示例</span></div>
        <div data-xh-part="row-actions"><button data-xh-part="row-action">编辑</button></div>
      </div>
      <div data-xh-part="row" value="console">
        <span data-xh-part="row-selection-indicator"></span>
        <div data-xh-part="row-content"><span data-xh-part="row-text">管理后台</span><span data-xh-part="row-description">运营与权限配置</span></div>
        <div data-xh-part="row-actions"><button data-xh-part="row-action">编辑</button></div>
      </div>
      <div data-xh-part="row" value="mobile">
        <span data-xh-part="row-selection-indicator"></span>
        <div data-xh-part="row-content"><span data-xh-part="row-text">移动端</span><span data-xh-part="row-description">现场工作台</span></div>
        <div data-xh-part="row-actions"><button data-xh-part="row-action">编辑</button></div>
      </div>
    </div>
  </xh-grid-list>
  <span id="grid-list-basic-readout" data-label>已选：docs；尚未执行行内操作</span>
</div>

<script type="module">
  const host = document.getElementById("grid-list-basic");
  const readout = document.getElementById("grid-list-basic-readout");
  host.value = ["docs"];
  host.addEventListener("value-change", (event) => {
    host.value = event.detail.value;
    readout.textContent = "已选：" + event.detail.value.join("、");
  });
  for (const button of host.querySelectorAll('[data-xh-part="row-action"]')) {
    button.addEventListener("click", () => {
      const row = button.closest('[data-xh-part="row"]');
      readout.textContent = "编辑 " + row.querySelector('[data-xh-part="row-text"]').textContent;
    });
  }
<\/script>
`;export{e as default};