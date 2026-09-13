const n=`<!-- 基础用法 | 调整侧栏和编辑区域的比例 -->
<xh-splitter
  panels='[{"id":"aside","min":20,"max":60},{"id":"main","min":25}]'
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(640px, 100%); block-size: 180px">
    <div data-xh-part="panel" index="0" style="padding: 16px; background: var(--xh-bg-subtle)">文件</div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1" style="padding: 16px; background: var(--xh-bg-brand-subtle)">编辑器</div>
  </div>
</xh-splitter>
`;export{n as default};
