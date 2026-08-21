const a=`<!-- 尺寸 | size 只改轨道厚度，不写即缺省中档 -->
<div style="width: 100%; display: grid; gap: 16px">
  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">sm</span>
    <xh-progress value="65" size="sm" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">缺省</span>
    <xh-progress value="65" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">lg</span>
    <xh-progress value="65" size="lg" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>
</div>
`;export{a as default};
