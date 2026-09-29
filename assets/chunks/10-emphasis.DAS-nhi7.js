const a=`<!-- 从外面强调一块 | 受控的 activeKey 写扇区名，图就强调那一块、中心与提示框跟着显示它：图外的筛选、列表或别的图都能这样指给读者看 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
  <xh-radio-group id="pie-chart-emphasis-choice" variant="segmented" default-value="none">
    <div data-xh-part="root" aria-label="突出显示的渠道">
      <span data-xh-part="thumb"></span>
      <div data-xh-part="item" value="none">
        <span data-xh-part="item-text">不突出</span>
      </div>
      <div data-xh-part="item" value="搜索">
        <span data-xh-part="item-text">搜索</span>
      </div>
      <div data-xh-part="item" value="直接访问">
        <span data-xh-part="item-text">直接访问</span>
      </div>
      <div data-xh-part="item" value="社交">
        <span data-xh-part="item-text">社交</span>
      </div>
      <div data-xh-part="item" value="邮件">
        <span data-xh-part="item-text">邮件</span>
      </div>
      <div data-xh-part="item" value="广告">
        <span data-xh-part="item-text">广告</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-pie-chart id="pie-chart-emphasis" name-field="channel" value-field="visits" style="width: 100%">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  const chart = document.getElementById("pie-chart-emphasis");
  const rows = [
    { channel: "搜索", visits: 4200 },
    { channel: "直接访问", visits: 2600 },
    { channel: "社交", visits: 1800 },
    { channel: "邮件", visits: 900 },
    { channel: "广告", visits: 500 },
  ];
  chart.data = rows;

  // 图外选中的那一项写进 activeKey；「不突出」对应 null
  document.getElementById("pie-chart-emphasis-choice").addEventListener("value-change", (event) => {
    chart.activeKey = event.detail.value === "none" ? null : event.detail.value;
  });
<\/script>
`;export{a as default};
