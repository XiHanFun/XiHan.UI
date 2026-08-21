const n=`<!-- 方向 | 四档：左右走横轴，上下走纵轴。轴另落成 data-orientation，竖着滚的窗口靠 --xh-marquee-block-size 定高 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">left</p>
    <xh-marquee direction="left">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">right</p>
    <xh-marquee direction="right">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">up</p>
    <xh-marquee direction="up">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">down</p>
    <xh-marquee direction="down">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>
</div>
`;export{n as default};
