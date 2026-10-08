var e=`<!-- 整段拖动 | draggableRange 让两端拇指之间的轨道可以整段拖动，时间窗宽度不变地平移；按在拇指上仍只推那一个 -->
<xh-slider default-value="9,12" min="0" max="24" draggable-range>
  <div data-xh-part="root" style="inline-size: 320px">
    <label data-xh-part="label">会议时段（时）</label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb" index="0"></div>
      <div data-xh-part="thumb" index="1"></div>
    </div>
  </div>
</xh-slider>
`;export{e as default};