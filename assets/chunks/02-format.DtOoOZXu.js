const a=`<!-- 码制 | qr 之外还有三种：工业打标用的 Data Matrix（rectangular 从矩形尺寸中选择）、运单证件用的 PDF417、票务用的 Aztec -->
<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-matrix-code value="SN-2026-0915-0001" pixel-size="120">
      <svg data-xh-part="root"></svg>
    </xh-matrix-code>
    <span style="font-size: 12px">qr</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-matrix-code format="data-matrix" value="SN-2026-0915-0001" pixel-size="120">
      <svg data-xh-part="root"></svg>
    </xh-matrix-code>
    <span style="font-size: 12px">data-matrix</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-matrix-code format="data-matrix" value="SN-2026-0915-0001" rectangular pixel-size="240">
      <svg data-xh-part="root"></svg>
    </xh-matrix-code>
    <span style="font-size: 12px">data-matrix · rectangular</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-matrix-code format="pdf417" value="SN-2026-0915-0001" pixel-size="240">
      <svg data-xh-part="root"></svg>
    </xh-matrix-code>
    <span style="font-size: 12px">pdf417</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-matrix-code format="aztec" value="SN-2026-0915-0001" pixel-size="120">
      <svg data-xh-part="root"></svg>
    </xh-matrix-code>
    <span style="font-size: 12px">aztec</span>
  </div>
</div>
`;export{a as default};
