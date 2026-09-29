const t=`<!-- 时区 | time-zone 给了 IANA 时区名就按那个时区的墙钟显示，datetime 带上该时区的偏移量；不带偏移量的 value 串也按这个时区解读 -->
<!-- 同一个时刻：带 Z 的串是确切时刻，与时区无关 -->
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <span>上海</span>
  <xh-timestamp value="2026-08-11T01:30:00Z" time-zone="Asia/Shanghai" locale="zh-CN">
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <span>伦敦</span>
  <xh-timestamp value="2026-08-11T01:30:00Z" time-zone="Europe/London" locale="zh-CN">
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <span>纽约</span>
  <xh-timestamp value="2026-08-11T01:30:00Z" time-zone="America/New_York" locale="zh-CN">
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>
`;export{t as default};
