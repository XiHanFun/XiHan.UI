const e=`<!-- 失败要说出来 | 取数抛出或拒绝都会退回 idle 并派 download-error，按钮不会一直停在"下载中" -->
<div style="display: flex; align-items: center; gap: 10px">
  <xh-download-trigger id="download-trigger-error" file-name="report.csv">
    <button data-xh-part="root">导出报表（必失败）</button>
  </xh-download-trigger>
  <span id="download-trigger-error-message" style="font-size: 13px">
    还没试过
  </span>
</div>

<script type="module">
  const host = document.getElementById("download-trigger-error");
  const message = document.getElementById("download-trigger-error-message");

  host.data = () => Promise.reject(new Error("导出接口没响应"));
  host.addEventListener("download-error", (event) => {
    message.textContent = \`下载失败：\${event.detail.error.message}\`;
  });
<\/script>
`;export{e as default};
