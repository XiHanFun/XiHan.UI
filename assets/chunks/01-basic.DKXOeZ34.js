var e=`<!-- 计数角标 | 被标记的元素写进默认插槽，角标自行贴到它的角上；计数、上限截断与 0 值收起都由角标计算 -->
<div style="display: flex; align-items: center; gap: 24px">
  <xh-badge id="badge-basic-inbox" count="5" tone="danger" label="5 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">收件箱</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <xh-badge count="128" max="99" tone="danger" label="128 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">通知</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <!-- 计数为 0 时整枚收起，宿主不必自己判 -->
  <xh-badge count="0" tone="danger">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">已读完</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <div style="display: flex; gap: 8px">
    <xh-button id="badge-basic-inc" size="sm"><button data-xh-part="root">+1</button></xh-button>
    <xh-button id="badge-basic-dec" size="sm"><button data-xh-part="root">-1</button></xh-button>
  </div>
</div>

<script type="module">
  // 计数由这段脚本持有：改了就把计数与读屏文案一起写回角标
  const badge = document.getElementById("badge-basic-inbox");
  let count = 5;

  function apply(next) {
    count = next;
    badge.count = count;
    badge.label = \`\${count} 条未读\`;
  }

  document.getElementById("badge-basic-inc").addEventListener("click", () => apply(count + 1));
  document.getElementById("badge-basic-dec").addEventListener("click", () => apply(Math.max(0, count - 1)));
<\/script>
`;export{e as default};