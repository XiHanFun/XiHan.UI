var e=`<!-- 相对时间 | 一分钟以内是「现在」，其余按分、时、天取整，过去说「几分钟前」、将来说「几分钟后」，离现在三十天及以上退回绝对日期；用词由 Intl 按 locale 给出，未提供时跟随浏览器语言 -->
<!-- 参照时刻给定后产出完全确定，不给则取当前时刻 -->
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <xh-timestamp
    value="2026-08-11T11:59:40"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T11:59:40"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp
    value="2026-08-11T11:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T11:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp
    value="2026-08-11T09:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T09:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp
    value="2026-08-09T12:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-09T12:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <!-- 将来的时刻 -->
  <xh-timestamp
    value="2026-08-11T12:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T12:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <!-- 超过三十天，没有档位可用，改报绝对日期 -->
  <xh-timestamp
    value="2026-01-01T00:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-01-01T00:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>
`;export{e as default};