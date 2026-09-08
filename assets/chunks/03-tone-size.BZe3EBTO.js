const n=`<!-- 语气与尺寸 | tone 换指示符与状态文案的色族，size 换标题行与正文的几何档；五份都挂在思考中，正文自动展开 -->
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-reasoning class="reasoning-axes" tone="success" streaming>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">正在思考…</span>
      </button>
      <div data-xh-part="content">success：先看约束，再看目标。</div>
    </div>
  </xh-reasoning>
  <xh-reasoning class="reasoning-axes" tone="warning" streaming>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">正在思考…</span>
      </button>
      <div data-xh-part="content">warning：先看约束，再看目标。</div>
    </div>
  </xh-reasoning>
  <xh-reasoning class="reasoning-axes" tone="danger" streaming>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">正在思考…</span>
      </button>
      <div data-xh-part="content">danger：先看约束，再看目标。</div>
    </div>
  </xh-reasoning>
  <xh-reasoning class="reasoning-axes" size="sm" streaming>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">正在思考…</span>
      </button>
      <div data-xh-part="content">sm：先看约束，再看目标。</div>
    </div>
  </xh-reasoning>
  <xh-reasoning class="reasoning-axes" size="lg" streaming>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">正在思考…</span>
      </button>
      <div data-xh-part="content">lg：先看约束，再看目标。</div>
    </div>
  </xh-reasoning>
</div>

<script type="module">
  // 文案是对象，只走 property；{seconds} 由元素代入
  for (const panel of document.querySelectorAll(".reasoning-axes"))
    panel.translations = { label: "思考过程", thinking: "正在思考…", thoughtFor: "想了 {seconds} 秒" };
<\/script>
`;export{n as default};
