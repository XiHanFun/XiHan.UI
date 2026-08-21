const n=`<!-- 语气 | tone 决定进度段用哪族颜色，不写时沿用品牌色 -->
<div style="width: 100%; display: grid; gap: 12px">
  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">brand</span>
    <xh-progress value="65" tone="brand" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">neutral</span>
    <xh-progress value="65" tone="neutral" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">success</span>
    <xh-progress value="65" tone="success" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">warning</span>
    <xh-progress value="65" tone="warning" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">danger</span>
    <xh-progress value="65" tone="danger" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>

  <div style="display: flex; gap: 12px; align-items: center">
    <span style="min-width: 64px; font-size: 13px; opacity: 0.7">info</span>
    <xh-progress value="65" tone="info" style="flex: 1">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
      </div>
    </xh-progress>
  </div>
</div>
`;export{n as default};
