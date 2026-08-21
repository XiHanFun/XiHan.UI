const a=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-time-field variant="subtle" tone="brand" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">brand</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="neutral" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">neutral</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="success" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">success</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="warning" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">warning</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="danger" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">danger</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="info" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">info</label>
      <div data-xh-part="control">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
    </div>
  </xh-time-field>
</div>
`;export{a as default};
