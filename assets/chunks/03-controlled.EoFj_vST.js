const n=`<!-- 受控展开 | 传了 expandedValue 就由宿主说了算，组件只发 expanded-change 不落内部值，写回它才动 -->
<div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
  <div style="display: flex; gap: 8px">
    <xh-button id="json-controlled-expand" size="sm">
      <button data-xh-part="root">全部展开</button>
    </xh-button>
    <xh-button id="json-controlled-collapse" size="sm">
      <button data-xh-part="root">全部收起</button>
    </xh-button>
  </div>

  <xh-json-viewer id="json-controlled">
    <div data-xh-part="root"></div>
  </xh-json-viewer>

  <span>展开了 <span id="json-controlled-count">1</span> 处</span>
</div>

<script type="module">
  const viewer = document.getElementById("json-controlled");
  const countOut = document.getElementById("json-controlled-count");

  const payload = {
    request: { method: "POST", path: "/api/login" },
    response: { code: 200, body: { token: "eyJhbGciOi…", expiresIn: 7200 } },
  };
  viewer.value = payload;

  // 路径就是展开集合的元素：根是 $，往下每层用 [键的 JSON 串] 接着拼
  const ROOT = "$";
  const ALL = [
    ROOT,
    \`\${ROOT}["request"]\`,
    \`\${ROOT}["response"]\`,
    \`\${ROOT}["response"]["body"]\`,
  ];

  // 展开集合由这段脚本持有：组件只发意图，写回才真的改
  function setExpanded(value) {
    viewer.expandedValue = value;
    countOut.textContent = String(value.length);
  }

  setExpanded([ROOT]);
  viewer.addEventListener("expanded-change", (event) =>
    setExpanded(event.detail.value),
  );

  const button = (id) =>
    document.getElementById(id).querySelector('[data-xh-part="root"]');

  button("json-controlled-expand").addEventListener("click", () => setExpanded(ALL));
  button("json-controlled-collapse").addEventListener("click", () => setExpanded([]));
<\/script>
`;export{n as default};
