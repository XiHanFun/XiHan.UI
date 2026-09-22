const t=`<!-- 放不下时滚动 | 标签带只裁主轴，两端翻页钮与滚轮把被裁掉的标签挪进视野 -->
<xh-tabs default-value="华北">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="销售区域">
      <button data-xh-part="prev-trigger"></button>
      <button data-xh-part="trigger" value="华北">华北大区</button>
      <button data-xh-part="trigger" value="华东">华东大区</button>
      <button data-xh-part="trigger" value="华南">华南大区</button>
      <button data-xh-part="trigger" value="华中">华中大区</button>
      <button data-xh-part="trigger" value="西南">西南大区</button>
      <button data-xh-part="trigger" value="西北">西北大区</button>
      <button data-xh-part="trigger" value="东北">东北大区</button>
      <button data-xh-part="trigger" value="港澳台">港澳台大区</button>
      <button data-xh-part="trigger" value="海外">海外大区</button>
      <div data-xh-part="indicator"></div>
      <button data-xh-part="next-trigger"></button>
    </div>

    <div data-xh-part="content" value="华北">华北大区的销售概览。</div>
    <div data-xh-part="content" value="华东">华东大区的销售概览。</div>
    <div data-xh-part="content" value="华南">华南大区的销售概览。</div>
    <div data-xh-part="content" value="华中">华中大区的销售概览。</div>
    <div data-xh-part="content" value="西南">西南大区的销售概览。</div>
    <div data-xh-part="content" value="西北">西北大区的销售概览。</div>
    <div data-xh-part="content" value="东北">东北大区的销售概览。</div>
    <div data-xh-part="content" value="港澳台">港澳台大区的销售概览。</div>
    <div data-xh-part="content" value="海外">海外大区的销售概览。</div>
  </div>
</xh-tabs>
`;export{t as default};
