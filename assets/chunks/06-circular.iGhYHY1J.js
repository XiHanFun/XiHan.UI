const n=`<!-- 循环引用 | 值出现在自己的祖先链上就停下并标成 [Circular]，不会无限递归；共享引用不算环，照样摊开 -->
<xh-json-viewer id="json-circular" default-expanded-depth="2">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>

<script type="module">
  const shared = { id: 1 };
  const node = { name: "root", left: shared, right: shared };
  // 指回自己：摊到这里就停
  node.parent = node;

  document.getElementById("json-circular").value = node;
<\/script>
`;export{n as default};
