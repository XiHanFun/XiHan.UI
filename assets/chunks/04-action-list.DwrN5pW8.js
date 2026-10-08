var e=`<!-- Action List | 不保留选择，Enter 或点击行触发主操作，行内按钮仍独立 -->
<div data-demo-stack>
  <xh-grid-list id="grid-list-actions" selection-mode="none">
    <div data-xh-part="root">
      <div data-xh-part="row" value="open"><div data-xh-part="row-content"><span data-xh-part="row-text">打开项目</span></div><div data-xh-part="row-actions"><button data-xh-part="row-action">说明</button></div></div>
      <div data-xh-part="row" value="duplicate"><div data-xh-part="row-content"><span data-xh-part="row-text">复制项目</span></div><div data-xh-part="row-actions"><button data-xh-part="row-action">说明</button></div></div>
      <div data-xh-part="row" value="archive"><div data-xh-part="row-content"><span data-xh-part="row-text">归档项目</span></div><div data-xh-part="row-actions"><button data-xh-part="row-action">说明</button></div></div>
    </div>
  </xh-grid-list>
  <span id="grid-list-actions-readout" data-label>等待操作</span>
</div>
<script type="module">
  const host = document.getElementById("grid-list-actions");
  const readout = document.getElementById("grid-list-actions-readout");
  host.addEventListener("action", event => { readout.textContent = "主操作：" + event.detail.value; });
  for (const button of host.querySelectorAll('[data-xh-part="row-action"]')) {
    button.addEventListener("click", () => {
      readout.textContent = "说明：" + button.closest('[data-xh-part="row"]').querySelector('[data-xh-part="row-text"]').textContent;
    });
  }
<\/script>
`;export{e as default};