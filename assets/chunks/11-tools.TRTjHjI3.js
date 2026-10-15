var e=`<!-- 内建工具条 | tools 打开内建工具条：树档有展开全部 / 收起全部，原文档有自动换行，复制原文与原文开关固定在末端；数组只铺列出的几项 -->
<div style="display: flex; flex-direction: column; gap: 16px; inline-size: 100%; max-inline-size: 480px">
  <xh-json-viewer class="json-tools-demo" tools default-expanded-depth="2">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
  <xh-json-viewer class="json-tools-demo" tools="copy view" default-view="text">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
</div>

<script type="module">
  const payload = {
    traceId: "9ef5a8c3e1b44f0f",
    request: {
      method: "POST",
      url: "/api/workflow/definition/new-version?tenant=hangzhou-branch&operator=owner&reason=quarterly-review",
      headers: { "content-type": "application/json", "x-request-id": "c0d1e2f3" },
    },
    response: { status: 200, elapsed: 35, body: { id: "207795978470952990", version: 3 } },
  };

  for (const viewer of document.querySelectorAll(".json-tools-demo"))
    viewer.value = payload;
<\/script>
`;export{e as default};