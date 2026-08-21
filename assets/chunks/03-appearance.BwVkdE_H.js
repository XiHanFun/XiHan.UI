const n=`<!-- 角度、疏密与深浅 | rotate 转整块图样，gap 决定两块之间留多少空白，fontSize 与 opacity 决定字多大、印多深 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-watermark
    text="曦寒"
    style="
      display: block;
      inline-size: 220px;
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">缺省</div>
      </div>
    </div>
  </xh-watermark>

  <xh-watermark
    text="曦寒"
    rotate="0"
    gap="8"
    font-size="12"
    opacity="0.18"
    style="
      display: block;
      inline-size: 220px;
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">
          平着排、印得密
        </div>
      </div>
    </div>
  </xh-watermark>

  <xh-watermark
    text="曦寒"
    rotate="-45"
    gap="56"
    font-size="18"
    opacity="0.12"
    style="
      display: block;
      inline-size: 220px;
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">
          转 45 度、印得疏
        </div>
      </div>
    </div>
  </xh-watermark>
</div>
`;export{n as default};
