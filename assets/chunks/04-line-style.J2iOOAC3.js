const a=`<!-- 线型、粗细与颜色 | variant 三档换深浅，dashed 画虚线（横竖各自成立），粗细与颜色仍是两个槽位 -->
<div style="width: 100%; display: grid; gap: 10px">
  <span style="font-size: 13px">实线（缺省）</span>
  <!-- 宿主不占布局，分隔线本体直接落进外层排版 -->
  <xh-separator decorative style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>

  <span style="font-size: 13px">弱线 / 强线</span>
  <xh-separator decorative variant="subtle" style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>
  <xh-separator decorative variant="strong" style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>

  <span style="font-size: 13px">虚线</span>
  <xh-separator decorative dashed style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>

  <span style="font-size: 13px">虚线段拉长、空白收窄</span>
  <xh-separator decorative dashed style="display: contents">
    <div
      data-xh-part="root"
      style="--xh-separator-dash-length: 12px; --xh-separator-dash-gap: 4px"
    ></div>
  </xh-separator>

  <span style="font-size: 13px">加粗并换色</span>
  <xh-separator decorative style="display: contents">
    <div
      data-xh-part="root"
      style="--xh-separator-thickness: 3px; --xh-separator-color: var(--xh-color-brand-500)"
    ></div>
  </xh-separator>

  <!-- 竖向同样成立：虚线的方向由 data-orientation 决定，不用另写表达式 -->
  <div style="display: flex; align-items: center; gap: 12px; height: 32px">
    <span style="font-size: 13px">左</span>
    <xh-separator orientation="vertical" decorative dashed style="display: contents">
      <div data-xh-part="root"></div>
    </xh-separator>
    <span style="font-size: 13px">右</span>
  </div>
</div>
`;export{a as default};
