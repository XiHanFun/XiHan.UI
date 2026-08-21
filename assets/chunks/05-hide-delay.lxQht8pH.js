const n=`<!-- 收起的等待 | type 为 scroll 时滚动条停手后不立刻收起，scrollHideDelay 决定还留多少毫秒 -->
<div id="scroll-area-hide-delay" style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
  <div style="display: grid; gap: 6px">
    <span>200ms：停手就收</span>
    <xh-scroll-area type="scroll" scroll-hide-delay="200">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 200px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-scroll-area>
  </div>

  <div style="display: grid; gap: 6px">
    <span>2000ms：停手后还留两秒</span>
    <xh-scroll-area type="scroll" scroll-hide-delay="2000">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 200px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-scroll-area>
  </div>
</div>

<script type="module">
  // 两份都填上同样的 20 行
  const contents = document
    .getElementById("scroll-area-hide-delay")
    .querySelectorAll('[data-xh-part="content"]');
  for (const content of contents) {
    for (let i = 1; i <= 20; i++) {
      const line = document.createElement("p");
      line.style.cssText = "margin: 0; line-height: 22px";
      line.textContent = \`第 \${i} 行\`;
      content.append(line);
    }
  }
<\/script>
`;export{n as default};
