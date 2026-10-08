var e=`<!-- 拒绝要写理由 | requireReason 让用户拒绝时必须写明理由：备注空着就按拒绝或 Escape，焦点落到备注框并标为无效，写上理由再按才拒绝；超时照常按拒绝收口 -->
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-approval id="approval-reason" require-reason>
    <div data-xh-part="root">
      <h3 data-xh-part="title">要删除远端分支 release/2.1</h3>
      <p data-xh-part="description">拒绝时写一句理由，Agent 会据此换个做法。</p>
      <input data-xh-part="note" />
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>
  <p id="approval-reason-decision" style="margin: 0"></p>
</div>

<script type="module">
  // 文案是对象，只走 property
  const gate = document.getElementById("approval-reason");
  const line = document.getElementById("approval-reason-decision");
  gate.translations = { reason: "拒绝理由（必填）", notePlaceholder: "说明为什么不让它做" };
  gate.addEventListener("decision", (event) => {
    const { decision, note } = event.detail;
    line.textContent = \`判定：\${decision}（理由 \${note ?? "无"}）\`;
  });
<\/script>
`;export{e as default};