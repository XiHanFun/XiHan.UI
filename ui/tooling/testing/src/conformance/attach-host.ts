import { PORTAL_ROOT_ID } from '@xihan-ui/kernel'

// 测试宿主的落位：portal 落点必须始终是 body 的最后一个孩子。
//
// 落点是「body 末尾的单一浮层容器」，建好之后就留在文档里不再销毁。适配器宿主要是
// 一律往 body 末尾追加，第二个用例起宿主就排到了落点后面——同一个部件在浮层里与在
// 常规流里的文档序会互换，`part[1]` 这类下标随之指向另一个元素。宿主插在落点之前，
// 文档序便恒为「常规流在前、浮层在后」，与落点自身的约定一致。
export function attachHost(host: Element, doc: Document = document): void {
  const portalRoot = doc.getElementById(PORTAL_ROOT_ID)
  if (portalRoot?.parentNode === doc.body)
    doc.body.insertBefore(host, portalRoot)
  else
    doc.body.appendChild(host)
}
