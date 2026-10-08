var e=`<!-- 级别过滤 | levels 只显示所选级别的行，用切换按钮组选；没写级别的行不受影响 -->
<div style="display: grid; gap: 12px; inline-size: 100%">
  <xh-toggle-group id="log-filter-levels" multiple>
    <div data-xh-part="root" aria-label="显示的级别">
      <button data-xh-part="item" value="debug">Debug</button>
      <button data-xh-part="item" value="info">Info</button>
      <button data-xh-part="item" value="warn">Warn</button>
      <button data-xh-part="item" value="error">Error</button>
    </div>
  </xh-toggle-group>
  <xh-log id="log-filter" rows="6" levels="info warn error">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content">
          <div data-xh-part="line" level="debug">12:00:01  读取配置 config/app.yaml</div>
          <div data-xh-part="line" level="info">12:00:02  数据库连接池就绪</div>
          <div data-xh-part="line" level="info">12:00:04  POST /api/orders  201  118ms</div>
          <div data-xh-part="line" level="warn">12:00:05  慢查询 1,240ms  select * from orders</div>
          <div data-xh-part="line" level="error">12:00:06  支付网关超时，第 1 次重试</div>
          <div data-xh-part="line" level="info">12:00:08  支付网关恢复，订单 8812 已确认</div>
        </div>
      </div>
    </div>
  </xh-log>
</div>

<script type="module">
  // 多选的初值是数组，走 property；选中的级别写回日志的 levels 属性，空白分隔
  const log = document.getElementById("log-filter");
  const group = document.getElementById("log-filter-levels");
  group.defaultValue = ["info", "warn", "error"];
  group.addEventListener("value-change", (event) => {
    log.setAttribute("levels", event.detail.value.join(" "));
  });
<\/script>
`;export{e as default};