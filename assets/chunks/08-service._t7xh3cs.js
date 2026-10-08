var e=`<!-- 全局服务 | createNotificationService 自带宿主，传 preset: 'toast' 即轻提示；模块作用域随处可调用（请求拦截器、store） -->
<div style="display: flex; flex-wrap: wrap; gap: 8px">
  <xh-button id="notification-service-save" variant="solid">
    <button data-xh-part="root">保存（loading 收尾成 success）</button>
  </xh-button>
  <xh-button id="notification-service-success" variant="outline">
    <button data-xh-part="root">success</button>
  </xh-button>
  <xh-button id="notification-service-warning" variant="outline">
    <button data-xh-part="root">warning</button>
  </xh-button>
  <xh-button id="notification-service-danger" variant="outline">
    <button data-xh-part="root">danger</button>
  </xh-button>
</div>

<script type="module">
  import { createNotificationService } from "@xihan-ui/web-components/services";

  // 服务自带宿主，建一次，句柄在模块作用域随处可调
  const toast = createNotificationService({ preset: "toast" });

  document.getElementById("notification-service-save").addEventListener("click", () => {
    const id = toast.loading("保存中");
    setTimeout(() => toast.update(id, { loading: false, tone: "success", title: "已保存" }), 900);
  });
  document.getElementById("notification-service-success").addEventListener("click", () => toast.success("已发布"));
  document.getElementById("notification-service-warning").addEventListener("click", () => toast.warning("配额即将用尽"));
  document.getElementById("notification-service-danger").addEventListener("click", () => toast.danger("同步失败"));
<\/script>
`;export{e as default};