const t=`<!-- 播报方式 | 缺省 polite 让 root 成为活区，筛完就地播报；off 让它只是个普通容器 -->
<div id="empty-state-live" style="inline-size: 100%; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <input id="empty-state-live-keyword" type="search" aria-label="关键词" value="曦寒" />
    <button id="empty-state-live-search" type="button">搜索</button>
  </div>

  <!-- 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 -->
  <xh-empty-state live="polite">
    <div data-xh-part="root" id="empty-state-live-root">
      <span data-xh-part="icon">∅</span>
      <p data-xh-part="title" id="empty-state-live-title">没有匹配「曦寒」的结果</p>
      <p data-xh-part="description">换个词，或者去掉几个筛选条件。</p>
    </div>
  </xh-empty-state>
  <p id="empty-state-live-hit" hidden style="margin: 0">一条命中的记录</p>
</div>

<script type="module">
  // 演示用：偶数长度的关键词当作有结果
  const keyword = document.getElementById("empty-state-live-keyword");
  const title = document.getElementById("empty-state-live-title");
  const root = document.getElementById("empty-state-live-root");
  const hit = document.getElementById("empty-state-live-hit");
  document.getElementById("empty-state-live-search").addEventListener("click", () => {
    const found = keyword.value.length % 2 === 0;
    title.textContent = \`没有匹配「\${keyword.value}」的结果\`;
    // 活区节点常挂着，两块用 hidden 互相收起
    root.hidden = found;
    hit.hidden = !found;
  });
<\/script>
`;export{t as default};
