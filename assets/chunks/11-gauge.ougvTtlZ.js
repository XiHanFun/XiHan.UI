const a=`<!-- 仪表盘 | 量（semantics="meter"）的仪表盘：thresholds 画出分段色带，scale 画出量程刻度，indicator 选填充或指针 -->
<!-- 色带、刻度与指针由元素按数据生成进 canvas 与 root，作者只写外壳 -->
<div style="display: flex; align-items: center; gap: var(--xh-space-8); flex-wrap: wrap">
  <xh-progress data-demo="progress-gauge" variant="dashboard" semantics="meter" value="72" size="lg" scale>
    <div data-xh-part="root" aria-label="CPU 占用">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
      <div data-xh-part="label"><strong style="font-size: var(--xh-text-heading-3-size)">72%</strong></div>
    </div>
  </xh-progress>

  <xh-progress data-demo="progress-gauge" variant="dashboard" semantics="meter" value="72" size="lg" indicator="needle" scale>
    <div data-xh-part="root" aria-label="CPU 占用">
      <svg data-xh-part="canvas">
        <circle data-xh-part="track"></circle>
        <circle data-xh-part="range"></circle>
      </svg>
      <div data-xh-part="label"><span>72%</span></div>
    </div>
  </xh-progress>
</div>

<script type="module">
  // 分段按上界升序：当前值落在哪一段，填充就取那一段的语气，读屏在数值后补上分段名
  for (const el of document.querySelectorAll("[data-demo='progress-gauge']")) {
    el.thresholds = [
      { value: 60, tone: "success", label: "正常" },
      { value: 85, tone: "warning", label: "警戒" },
      { value: 100, tone: "danger", label: "过载" },
    ];
    // 读屏文字的模板按语言改写：缺省是英文的「72%, 警戒」
    el.translations = { segmentValueText: ({ value, label }) => \`\${value}，\${label}\` };
  }
<\/script>
`;export{a as default};
