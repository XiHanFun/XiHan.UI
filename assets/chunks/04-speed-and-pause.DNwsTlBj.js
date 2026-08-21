const n=`<!-- 速度与暂停 | speed 是每秒像素；pauseOnHover 在指针停下或焦点落进窗口时停住 -->
<div style="display: flex; flex-direction: column; gap: 16px">
  <div>
    <p style="margin-block-end: 6px; font-size: 12px">speed = 30（每秒 30 像素）</p>
    <!-- 给了 speed 时 root 的内联样式归组件管，外观写在宿主元素上 -->
    <xh-marquee
      speed="30"
      auto-fill
      pause-on-hover
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
          <div data-xh-copy="1" aria-hidden="true" inert>
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div>
    <p style="margin-block-end: 6px; font-size: 12px">speed = 60（每秒 60 像素）</p>
    <xh-marquee
      speed="60"
      auto-fill
      pause-on-hover
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
          <div data-xh-copy="1" aria-hidden="true" inert>
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div>
    <p style="margin-block-end: 6px; font-size: 12px">speed = 140（每秒 140 像素）</p>
    <xh-marquee
      speed="140"
      auto-fill
      pause-on-hover
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
          <div data-xh-copy="1" aria-hidden="true" inert>
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>
</div>
`;export{n as default};
