import { ContextMode, ReturnDataType, SendMsgBase, SendMsgPayload } from '@/napcat-onebot/action/msg/SendMsg';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { GuildActionsExamples } from '@/napcat-onebot/action/example/GuildActionsExamples';

class SendGuildMsg extends SendMsgBase {
  override actionName = ActionName.SendGuildMsg;
  override actionSummary = '发送频道消息';
  override actionDescription = '发送频道消息';
  override actionTags = ['频道接口'];
  override payloadExample = GuildActionsExamples.SendGuildMsg.payload;
  override returnExample = GuildActionsExamples.SendGuildMsg.response;

  protected override async check (payload: SendMsgPayload): Promise<BaseCheckResult> {
    delete payload.user_id;
    delete payload.group_id;
    payload.message_type = 'guild';
    return super.check(payload);
  }

  override async _handle (payload: SendMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Guild);
  }
}

export default SendGuildMsg;
