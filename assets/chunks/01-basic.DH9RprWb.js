const a=`<!-- 基础用法 | root / viewport / content / line 四层；一行写什么由作者定，组件只给身份与等宽排版 -->
<xh-log rows="8" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="content">
        <div data-xh-part="line">12:00:01  boot     读取配置 config/app.yaml</div>
        <div data-xh-part="line">12:00:01  boot     监听 0.0.0.0:8080</div>
        <div data-xh-part="line">12:00:02  db       连接池就绪，最小 4 最大 32</div>
        <div data-xh-part="line">12:00:02  cache    命中率统计已开启</div>
        <div data-xh-part="line">12:00:03  http     GET  /health            200   3ms</div>
        <div data-xh-part="line">12:00:04  http     POST /api/orders        201  118ms</div>
        <div data-xh-part="line">12:00:05  http     GET  /api/orders/8812   200   21ms</div>
        <div data-xh-part="line">12:00:06  job      对账任务排入队列 batch-2026-08-10</div>
        <div data-xh-part="line">12:00:07  http     GET  /api/orders/8813   404    9ms</div>
        <div data-xh-part="line">12:00:08  job      对账任务完成，处理 1,204 笔</div>
      </div>
    </div>
  </div>
</xh-log>
`;export{a as default};
