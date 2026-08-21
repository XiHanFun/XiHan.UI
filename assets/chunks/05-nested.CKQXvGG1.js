const n=`<!-- 嵌套 | 面板里再放一套分栏即可拆出第二根轴，里外两层各管各的尺寸，互不干涉 -->
<xh-splitter
  panels='[{"id":"aside","min":15,"max":50},{"id":"workbench","min":30}]'
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: 100%; block-size: 220px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">侧栏</p>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <!-- 内层是另一套分栏：跨轴尺寸取满外层这一格 -->
      <xh-splitter
        panels='[{"id":"editor","min":20},{"id":"console","min":15}]'
        orientation="vertical"
        style="display: contents"
      >
        <div data-xh-part="root" style="inline-size: 100%; block-size: 100%">
          <div data-xh-part="panel" index="0">
            <p style="padding: 12px">编辑区</p>
          </div>
          <div data-xh-part="resize-trigger" index="0"></div>
          <div data-xh-part="panel" index="1">
            <p style="padding: 12px">输出区</p>
          </div>
        </div>
      </xh-splitter>
    </div>
  </div>
</xh-splitter>
`;export{n as default};
