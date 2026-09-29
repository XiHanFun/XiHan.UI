const a=`<!-- 指标卡 | 与统计数值组合：数值给出现在是多少，迷你图给出是怎么走到这里的；尺寸由组件槽放大到铺满卡片 -->
<xh-card>
  <div data-xh-part="root" style="inline-size: 18rem; max-inline-size: 100%">
    <div data-xh-part="content" style="display: grid; gap: var(--xh-space-3)">
      <xh-statistic tone="success" trend="up">
        <div data-xh-part="root">
          <span data-xh-part="label">本月营收</span>
          <span data-xh-part="value">138</span>
          <span data-xh-part="suffix">万元</span>
          <span data-xh-part="trend">较上月 5.3%</span>
        </div>
      </xh-statistic>
      <!-- 宿主元素缺省是行内元素：要铺满卡片时给它 display: block -->
      <xh-sparkline id="sparkline-stat-card" variant="area" style="display: block">
        <svg
          data-xh-part="root"
          aria-label="近 12 个月营收"
          style="--xh-sparkline-width: 100%; --xh-sparkline-height: var(--xh-space-8)"
        ></svg>
      </xh-sparkline>
    </div>
  </div>
</xh-card>

<script type="module">
  document.getElementById("sparkline-stat-card").data = [86, 92, 88, 97, 104, 99, 112, 118, 115, 126, 131, 138];
<\/script>
`;export{a as default};
