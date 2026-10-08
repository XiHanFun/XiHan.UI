var e=`<!-- 子弹图 | 线形的量加上分段与目标：色带是好坏区间，中间一条是实际值，竖线是目标，下方是量程刻度 -->
<div style="display: grid; gap: var(--xh-space-2); inline-size: 100%; max-inline-size: 28rem">
  <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">本季销售额（万元）</span>
  <!-- 宿主元素缺省是行内元素：要铺满容器时给它 display: block -->
  <xh-progress id="progress-bullet" semantics="meter" value="286" max="400" target="340" scale style="display: block">
    <div data-xh-part="root" aria-label="本季销售额">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>
</div>

<script type="module">
  const bullet = document.getElementById("progress-bullet");
  // 本季销售额（万元）：0–240 差、240–320 良、320–400 优，目标 340
  bullet.thresholds = [
    { value: 240, tone: "danger", label: "差" },
    { value: 320, tone: "warning", label: "良" },
    { value: 400, tone: "success", label: "优" },
  ];
  bullet.translations = { segmentValueText: ({ value, label }) => \`\${value}，\${label}\` };
<\/script>
`;export{e as default};