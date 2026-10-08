var e=`<!-- 说明与多选上下限 | 选项的 description 写进 item-description，跟着选项名一起念；多选的 minSelections / maxSelections 管选够与选满，数量要求写进题目说明 description 并描述选项组 -->
<div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px">
  <xh-question-flow id="question-flow-descriptions" auto-advance="false">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="cadence">
            <p data-xh-part="prompt" question-id="cadence">按什么节奏发布？</p>
            <!-- 留空：元素写上题目自带的说明，或多选的数量要求 -->
            <p data-xh-part="description" question-id="cadence"></p>
            <div data-xh-part="group" question-id="cadence">
              <button data-xh-part="item" question-id="cadence" option-value="weekly">
                <span data-xh-part="item-indicator" question-id="cadence" option-value="weekly"></span>
                <span data-xh-part="item-text" question-id="cadence" option-value="weekly">每周</span>
                <span data-xh-part="item-description" question-id="cadence" option-value="weekly">小步快跑，回滚成本低</span>
              </button>
              <button data-xh-part="item" question-id="cadence" option-value="monthly">
                <span data-xh-part="item-indicator" question-id="cadence" option-value="monthly"></span>
                <span data-xh-part="item-text" question-id="cadence" option-value="monthly">每月</span>
                <span data-xh-part="item-description" question-id="cadence" option-value="monthly">攒一批再发，说明写得更完整</span>
              </button>
            </div>
          </div>
          <div data-xh-part="question" question-id="checks">
            <p data-xh-part="prompt" question-id="checks">上线前跑哪些检查？</p>
            <p data-xh-part="description" question-id="checks"></p>
            <div data-xh-part="group" question-id="checks">
              <button data-xh-part="item" question-id="checks" option-value="unit">
                <span data-xh-part="item-indicator" question-id="checks" option-value="unit"></span>
                <span data-xh-part="item-text" question-id="checks" option-value="unit">单元测试</span>
              </button>
              <button data-xh-part="item" question-id="checks" option-value="e2e">
                <span data-xh-part="item-indicator" question-id="checks" option-value="e2e"></span>
                <span data-xh-part="item-text" question-id="checks" option-value="e2e">端到端</span>
                <span data-xh-part="item-description" question-id="checks" option-value="e2e">约 20 分钟</span>
              </button>
              <button data-xh-part="item" question-id="checks" option-value="bench">
                <span data-xh-part="item-indicator" question-id="checks" option-value="bench"></span>
                <span data-xh-part="item-text" question-id="checks" option-value="bench">性能基准</span>
                <span data-xh-part="item-description" question-id="checks" option-value="bench">只在夜里跑</span>
              </button>
              <button data-xh-part="item" question-id="checks" option-value="audit">
                <span data-xh-part="item-indicator" question-id="checks" option-value="audit"></span>
                <span data-xh-part="item-text" question-id="checks" option-value="audit">依赖安全扫描</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="submit-trigger">继续</button>
      </div>
      <div data-xh-part="live-region"></div>
    </div>
  </xh-question-flow>
  <p id="question-flow-descriptions-sent" style="margin: 0"></p>
</div>

<script type="module">
  // 题目与文案是对象，只走 property
  const flow = document.getElementById("question-flow-descriptions");
  const sent = document.getElementById("question-flow-descriptions-sent");
  const submit = flow.querySelector('[data-xh-part="submit-trigger"]');
  flow.questions = [
    {
      id: "cadence",
      prompt: "按什么节奏发布？",
      description: "会影响发布说明的写法。",
      type: "single",
      options: [
        { value: "weekly", label: "每周", description: "小步快跑，回滚成本低" },
        { value: "monthly", label: "每月", description: "攒一批再发，说明写得更完整" },
      ],
    },
    {
      id: "checks",
      prompt: "上线前跑哪些检查？",
      type: "multiple",
      // 没写 description 时，数量要求代填成题目说明
      minSelections: 2,
      maxSelections: 3,
      options: [
        { value: "unit", label: "单元测试" },
        { value: "e2e", label: "端到端", description: "约 20 分钟" },
        { value: "bench", label: "性能基准", description: "只在夜里跑" },
        { value: "audit", label: "依赖安全扫描" },
      ],
    },
  ];
  flow.translations = {
    selectionRange: (min, max) => (max === undefined ? \`至少选 \${min} 项\` : \`选 \${min} 到 \${max} 项\`),
  };
  // 末题上同一颗键的文字换成发送
  flow.addEventListener("index-change", (event) => {
    submit.textContent = event.detail.index === 1 ? "发送" : "继续";
  });
  flow.addEventListener("submit", (event) => {
    sent.textContent = \`收到：\${Object.entries(event.detail.answers).map(([id, values]) => \`\${id}=\${values.join("、")}\`).join("；")}\`;
  });
<\/script>
`;export{e as default};