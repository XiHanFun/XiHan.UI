import { version as VERSION } from '../../package.json'
import { XhButtonElement } from '../elements/button'
import { XhDialogElement } from '../elements/dialog'
import { XhLoadingBarElement } from '../elements/loading-bar'
import { XhNotificationElement, XhNotificationItemElement } from '../elements/notification'
import { XhToastElement } from '../elements/toast'
import { defineElement } from '../runtime/registry'

/**
 * 服务用到的那几个元素在服务建起来时注册。
 *
 * 服务自己生成节点，作者不写标签，因此不能要求他先 import `/define`；
 * 注册表是幂等的，已经注册过的原样跳过。
 */
export function defineFeedbackElements(): void {
  defineElement('xh-toast', XhToastElement, VERSION)
  defineElement('xh-notification', XhNotificationElement, VERSION)
  defineElement('xh-notification-item', XhNotificationItemElement, VERSION)
  defineElement('xh-dialog', XhDialogElement, VERSION)
  defineElement('xh-button', XhButtonElement, VERSION)
  defineElement('xh-loading-bar', XhLoadingBarElement, VERSION)
}
