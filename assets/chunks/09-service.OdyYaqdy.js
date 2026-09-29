const e=`<!-- 命令式服务 | createDialogService 的 confirm 与单按钮预设：一行调用弹出，onOk 返回 Promise 时确认按钮自动 pending 并阻止关闭；多次调用排队依次弹出 -->
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-button id="dialog-service-remove" variant="solid" tone="danger">
    <button data-xh-part="root">删除工作区</button>
  </xh-button>
  <xh-button id="dialog-service-error" variant="outline">
    <button data-xh-part="root">error 告知框</button>
  </xh-button>
  <span id="dialog-service-answer">上次答复：（还没问过）</span>
</div>

<script type="module">
  import { createDialogService } from "@xihan-ui/web-components/services";

  // 服务自带宿主，建一次，句柄在模块作用域随处可调
  const modal = createDialogService();
  const answer = document.getElementById("dialog-service-answer");

  document.getElementById("dialog-service-remove").addEventListener("click", async () => {
    const ok = await modal.confirm({
      title: "删除工作区",
      content: "删除后 30 天内还能恢复。",
      tone: "danger",
      okText: "删除",
      onOk: () => new Promise(resolve => setTimeout(resolve, 900)),
    });
    answer.textContent = \`上次答复：\${ok ? "已删除" : "取消了"}\`;
  });
  document.getElementById("dialog-service-error").addEventListener("click", () => {
    void modal.error({ title: "同步失败", content: "稍后重试。" });
  });
<\/script>
`;export{e as default};
