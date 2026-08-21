const n=`<!-- 事件 | open-change 带一份 { open }，报的是这次要落到的状态；非受控时内部开合也照发一次 -->
<div style="display: flex; align-items: center; gap: 16px">
  <xh-popover id="popover-event" placement="bottom-start">
    <button data-xh-part="trigger">点开再关掉</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">
          按钮、Escape、点浮层外部，三条路都会发一次意图。
        </p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
  <span>最近：<span id="popover-event-log">（还没动过）</span></span>
</div>

<script type="module">
  // 只留最近五条
  const readout = document.getElementById("popover-event-log");
  const log = [];
  document
    .getElementById("popover-event")
    .addEventListener("open-change", (event) => {
      log.unshift(event.detail.open ? "展开" : "收起");
      log.length = Math.min(log.length, 5);
      readout.textContent = log.join(" ← ");
    });
<\/script>
`;export{n as default};
