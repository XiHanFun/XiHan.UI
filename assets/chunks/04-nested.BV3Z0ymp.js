const n=`<!-- 嵌套分栏 | 组合水平和垂直面板 -->
<xh-splitter
  panels='[{"id":"aside","min":15,"max":50},{"id":"workbench","min":30}]'
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(640px, 100%); block-size: 240px">
    <div data-xh-part="panel" index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <xh-splitter
        panels='[{"id":"editor","min":20},{"id":"console","min":15}]'
        orientation="vertical"
        style="display: contents"
      >
        <div data-xh-part="root" style="inline-size: 100%; block-size: 100%">
          <div data-xh-part="panel" index="0" style="background: var(--xh-bg-brand-subtle)">
            <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
          </div>
          <div data-xh-part="resize-trigger" index="0"></div>
          <div data-xh-part="panel" index="1" style="background: var(--xh-bg-subtle)">
            <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
          </div>
        </div>
      </xh-splitter>
    </div>
  </div>
</xh-splitter>
`;export{n as default};
