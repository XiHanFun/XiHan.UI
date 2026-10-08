var e=`<!-- 按时区排时间刻度 | xAxis.timeZone 写 IANA 名：整点与整天落在那个时区的墙上时间上，刻度标签、提示框与数据表里的日期都按它写 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-time-zone">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">东京机房每 6 小时请求量（万次）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-cartesian-chart>
</div>

<script type="module">
  const chart = document.getElementById("cartesian-chart-time-zone");
  // 数据按 UTC 采样，第一条是东京 3 月 2 日零点
  const points = Array.from({ length: 13 }, (_, i) => ({
    time: new Date(Date.UTC(2024, 2, 1, 15 + i * 6)),
    requests: Math.round(40 + 30 * Math.sin(i / 2)),
  }));
  const series = [{ mark: "line", x: "time", y: "requests", name: "请求量" }];
  // 刻度按东京的墙上时间排：看的人在哪儿都一样
  const xAxis = { scale: "utc", timeZone: "Asia/Tokyo" };
  chart.data = points;
  chart.series = series;
  chart.xAxis = xAxis;
<\/script>
`;export{e as default};