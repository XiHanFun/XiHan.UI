const t=`<!-- 相对时间 | 刚刚 / n 分钟前 / n 小时前 / n 天前 四档，超过三十天退回绝对日期；locale 只换用词 -->
<!-- 参照时刻给定后产出完全确定，不给则取当前时刻 -->
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <xh-time value="2026-08-11T11:59:40" type="relative" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-time>
  <xh-time
    value="2026-08-11T11:59:40"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en"
  >
    <time data-xh-part="root"></time>
  </xh-time>

  <xh-time value="2026-08-11T11:30:00" type="relative" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-time>
  <xh-time
    value="2026-08-11T11:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en"
  >
    <time data-xh-part="root"></time>
  </xh-time>

  <xh-time value="2026-08-11T09:00:00" type="relative" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-time>
  <xh-time
    value="2026-08-11T09:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en"
  >
    <time data-xh-part="root"></time>
  </xh-time>

  <xh-time value="2026-08-09T12:00:00" type="relative" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-time>
  <xh-time
    value="2026-08-09T12:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en"
  >
    <time data-xh-part="root"></time>
  </xh-time>

  <!-- 超过三十天，四档都装不下，改报绝对日期 -->
  <xh-time value="2026-01-01T00:00:00" type="relative" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-time>
  <xh-time
    value="2026-01-01T00:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en"
  >
    <time data-xh-part="root"></time>
  </xh-time>
</div>
`;export{t as default};
