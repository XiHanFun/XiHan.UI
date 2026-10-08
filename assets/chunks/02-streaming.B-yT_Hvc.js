var e=`<!-- 流式增长 | 只有生长中的块每帧重渲，定型的块 key 不变、节点原地保留，选区与滚动位置才能保持；生长块里没写完的加粗先按闭合显示，不露出星号 -->
<xh-markdown-stream id="markdown-stream-streaming" streaming announce="polite" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="content"></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-markdown-stream>

<script type="module">
  // 真实应用里这份数组来自 @xihan-ui/markdown 的渲染器；这里手写两块来演示 key 的作用：
  // 第一块 key 不变、节点原地留着，末块 key 恒为 live、每帧重渲。
  // 原文是「每来一批字符只重渲**最后一块**。」：加粗还没写完时渲染器已按闭合产出 strong，星号不露出来
  const stream = document.getElementById("markdown-stream-streaming");
  const plain = "每来一批字符只重渲";
  const bold = "最后一块";
  const total = plain.length + bold.length + 1;

  let at = 0;
  const tick = () => {
    if (!stream.isConnected) return;
    at = Math.min(at + 3, total);
    const ended = at >= total;
    const strong = at > plain.length ? \`<strong>\${bold.slice(0, at - plain.length)}</strong>\` : "";
    stream.blocks = [
      { key: "0:a", kind: "markdown", html: "<h2>增量渲染</h2>", complete: true },
      {
        key: ended ? "1:b" : "live",
        kind: "markdown",
        html: \`<p>\${plain.slice(0, at)}\${strong}\${ended ? "。" : ""}</p>\`,
        complete: ended,
      },
    ];
    stream.toggleAttribute("streaming", !ended);
    if (!ended) setTimeout(tick, 70);
  };
  tick();
<\/script>
`;export{e as default};