var e=`<!-- 播报方式 | 默认 polite 使 root 成为活区，筛选完成后就地播报；off 使它只是一个普通容器 -->
<div id="empty-state-live" style="inline-size: 100%; display: grid; gap: 12px">
  <xh-input-group>
    <div data-xh-part="root">
      <xh-text-field id="empty-state-live-keyword" type="search" default-value="曦寒">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" aria-label="关键词" />
          </div>
        </div>
      </xh-text-field>
      <xh-button id="empty-state-live-search" variant="outline">
        <button data-xh-part="root">搜索</button>
      </xh-button>
    </div>
  </xh-input-group>

  <!-- 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 -->
  <xh-empty-state live="polite">
    <div data-xh-part="root" id="empty-state-live-root">
      <span data-xh-part="indicator">∅</span>
      <p data-xh-part="title" id="empty-state-live-title">没有匹配「曦寒」的结果</p>
      <p data-xh-part="description">换个词，或者去掉几个筛选条件。</p>
    </div>
  </xh-empty-state>
  <p id="empty-state-live-hit" hidden style="margin: 0">一条命中的记录</p>
</div>

<script type="module">
  // 演示用：偶数长度的关键词当作有结果
  const title = document.getElementById("empty-state-live-title");
  const root = document.getElementById("empty-state-live-root");
  const hit = document.getElementById("empty-state-live-hit");
  // 文本框非受控，报上来的新值记在这里，按下搜索时再用
  let keyword = "曦寒";
  document.getElementById("empty-state-live-keyword").addEventListener("value-change", (event) => {
    keyword = event.detail.value;
  });
  document.getElementById("empty-state-live-search").addEventListener("click", () => {
    const found = keyword.length % 2 === 0;
    title.textContent = \`没有匹配「\${keyword}」的结果\`;
    // 活区节点常挂着，两块用 hidden 互相收起
    root.hidden = found;
    hit.hidden = !found;
  });
<\/script>
`;export{e as default};