const n=`<!-- 基础用法 | panels 数组的长度决定面板块数，每条分隔条调的是它前面那一块 -->
<!-- 分栏必须先有一个确定的跨轴尺寸，才谈得上把它分成几份 -->
<xh-splitter
  panels='[{"id":"aside","min":20,"max":60},{"id":"main","min":25}]'
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: 100%; block-size: 140px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">侧栏：min 20% / max 60%，拖到底也留得住 20%。</p>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <p style="padding: 12px">正文：min 25%，侧栏再撑也吃不掉它这一份。</p>
    </div>
  </div>
</xh-splitter>
`;export{n as default};
