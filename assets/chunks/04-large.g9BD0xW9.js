const n=`<!-- 大数据 | maxItems 把超长数组折成一行占位，maxStringLength 截掉过长的字符串，一份大 JSON 不会把页面压住 -->
<xh-json-viewer
  id="json-large"
  default-expanded-depth="2"
  max-items="5"
  max-string-length="24"
>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>

<script type="module">
  // 240 条只摊出 5 条，其余收成一行占位
  document.getElementById("json-large").value = {
    total: 240,
    cursor:
      "eyJvZmZzZXQiOjAsImxpbWl0IjoyMCwic29ydCI6ImNyZWF0ZWRfYXQgZGVzYyJ9-very-long-token",
    items: Array.from({ length: 240 }, (_, i) => \`第 \${i + 1} 条\`),
  };
<\/script>
`;export{n as default};
