const t=`<!-- 自定义中心 | center 插槽替换环形中心的缺省合计：这里写出结论，而不是再放一个数字 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-center" name-field="status" value-field="count" sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本迭代任务</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <!-- center 里写了内容就归作者，元素不再写入合计 -->
        <div data-xh-part="center">
          <span id="pie-chart-center-done" style="font-size: var(--xh-text-heading-3-size); font-weight: var(--xh-font-weight-semibold)"></span>
          <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-secondary-size)">已完成</span>
        </div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  const tasks = [
    { status: "已完成", count: 72 },
    { status: "进行中", count: 18 },
    { status: "未开始", count: 10 },
  ];
  document.getElementById("pie-chart-center").data = tasks;
  // 中心写的是「完成了多少」，读者不用自己去加
  const done = Math.round((tasks[0].count / tasks.reduce((sum, t) => sum + t.count, 0)) * 100);
  document.getElementById("pie-chart-center-done").textContent = \`\${done}%\`;
<\/script>
`;export{t as default};
