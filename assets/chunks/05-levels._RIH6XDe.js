const a=`<!-- 行的样子归作者 | line 只发身份与等宽排版，级别配色、时间戳、行内标记这些都写在行里 -->
<xh-log rows="6" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="content">
        <!-- 行内容整段写在一行里：line 是 white-space: pre，源码换行会被当成真的换行 -->
        <div data-xh-part="line"><span style="color: var(--xh-fg-subtle)">12:00:01  </span><span style="color: var(--xh-fg-muted)">[INFO]   </span><span>读取配置 config/app.yaml</span></div>
        <div data-xh-part="line"><span style="color: var(--xh-fg-subtle)">12:00:02  </span><span style="color: var(--xh-fg-success)">[OK]     </span><span>数据库连接池就绪</span></div>
        <div data-xh-part="line"><span style="color: var(--xh-fg-subtle)">12:00:04  </span><span style="color: var(--xh-fg-muted)">[INFO]   </span><span>POST /api/orders  201  118ms</span></div>
        <div data-xh-part="line"><span style="color: var(--xh-fg-subtle)">12:00:05  </span><span style="color: var(--xh-fg-brand)">[WARN]   </span><span>慢查询 1,240ms  select * from orders</span></div>
        <div data-xh-part="line"><span style="color: var(--xh-fg-subtle)">12:00:06  </span><span style="color: var(--xh-fg-danger)">[ERROR]  </span><span>支付网关超时，第 1 次重试</span></div>
        <div data-xh-part="line"><span style="color: var(--xh-fg-subtle)">12:00:08  </span><span style="color: var(--xh-fg-success)">[OK]     </span><span>支付网关恢复，订单 8812 已确认</span></div>
      </div>
    </div>
  </div>
</xh-log>
`;export{a as default};
