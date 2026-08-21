const a=`<!-- 自定义外观 | 轨道色、进度段色与轨道厚度各是一个组件令牌，纯色与渐变都塞得进去 -->
<div style="width: 100%; display: grid; gap: 16px">
  <!-- 进度段与轨道各换一个颜色，语气档之外的配色写在这里 -->
  <xh-progress value="45">
    <div
      data-xh-part="root"
      style="--xh-progress-range: #f0a020; --xh-progress-track: rgba(240, 160, 32, 0.2)"
    >
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>

  <!-- 进度段接的是 background，写渐变一样成立 -->
  <xh-progress value="80">
    <div
      data-xh-part="root"
      style="--xh-progress-range: linear-gradient(90deg, #22d3ee, #2563eb)"
    >
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>

  <!-- 厚度是单独一个令牌，三个尺寸档之外的数值直接写死 -->
  <xh-progress value="60">
    <div data-xh-part="root" style="--xh-progress-thickness: 14px">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>
</div>
`;export{a as default};
