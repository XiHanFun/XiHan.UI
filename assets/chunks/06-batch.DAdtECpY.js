const t=`<!-- 批量处理 | 闸门是单发的，批量是宿主的编排：每条请求一个闸门、判定受控，上面一行放全部批准与全部拒绝；全部批准只收必选项已勾满的那几条（canApproveScopes），没勾满的留着逐条处理 -->
<div id="approval-batch" style="display: grid; gap: 12px; inline-size: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <span id="approval-batch-count">3 项待决</span>
    <xh-button size="sm"><button data-xh-part="root" id="approval-batch-approve">全部批准（2）</button></xh-button>
    <xh-button size="sm" variant="outline"><button data-xh-part="root" id="approval-batch-deny">全部拒绝</button></xh-button>
  </div>
  <xh-approval request-id="r1" status="pending">
    <div data-xh-part="root">
      <h3 data-xh-part="title">读取 package.json</h3>
      <p data-xh-part="description">只读，不改任何文件。</p>
      <div data-xh-part="result" hidden></div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>
  <xh-approval request-id="r2" status="pending">
    <div data-xh-part="root">
      <h3 data-xh-part="title">运行 pnpm install</h3>
      <p data-xh-part="description">会改写 node_modules 与锁文件。</p>
      <div data-xh-part="group">
        <div data-xh-part="item" scope-value="network" scope-label="访问网络下载依赖" scope-required>
          <span data-xh-part="item-indicator" scope-value="network"></span>
          <span data-xh-part="item-text" scope-value="network">访问网络下载依赖</span>
        </div>
      </div>
      <div data-xh-part="result" hidden></div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>
  <xh-approval request-id="r3" status="pending">
    <div data-xh-part="root">
      <h3 data-xh-part="title">写入 src/config.ts</h3>
      <p data-xh-part="description">把超时从 5 秒改成 30 秒。</p>
      <div data-xh-part="result" hidden></div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>
</div>

<script type="module">
  const board = document.getElementById("approval-batch");
  const gates = [...board.querySelectorAll("xh-approval")];
  const count = document.getElementById("approval-batch-count");
  const approveAll = document.getElementById("approval-batch-approve");
  const denyAll = document.getElementById("approval-batch-deny");

  // 每条请求的必选项与已勾选的授权项，由宿主记着
  const required = { r2: ["network"] };
  const granted = new Map(gates.map(gate => [gate.getAttribute("request-id"), []]));
  const canApprove = id => (required[id] ?? []).every(value => granted.get(id).includes(value));

  function settle(gate, status) {
    gate.setAttribute("status", status);
    gate.querySelector('[data-xh-part="result"]').textContent = status === "approved" ? "已批准" : "已拒绝";
  }

  function refresh() {
    const pending = gates.filter(gate => gate.getAttribute("status") === "pending");
    // 必选项没勾满的批不了：批量批准跳过它们，留给用户逐条处理
    const approvable = pending.filter(gate => canApprove(gate.getAttribute("request-id")));
    count.textContent = \`\${pending.length} 项待决\`;
    approveAll.textContent = \`全部批准（\${approvable.length}）\`;
    approveAll.disabled = approvable.length === 0;
    denyAll.disabled = pending.length === 0;
    return { pending, approvable };
  }

  for (const gate of gates) {
    const id = gate.getAttribute("request-id");
    // 判定受控：闸门报出意图，宿主写回才落定
    gate.addEventListener("decision", (event) => {
      settle(gate, event.detail.decision);
      refresh();
    });
    gate.addEventListener("granted-scopes-change", (event) => {
      granted.set(id, event.detail.value);
      refresh();
    });
  }
  approveAll.addEventListener("click", () => {
    for (const gate of refresh().approvable)
      settle(gate, "approved");
    refresh();
  });
  denyAll.addEventListener("click", () => {
    for (const gate of refresh().pending)
      settle(gate, "denied");
    refresh();
  });
  refresh();
<\/script>
`;export{t as default};
