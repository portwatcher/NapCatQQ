import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { resolveGuildChatType } from '@/napcat-onebot/action/msg/SendMsg';
import { OB11Message } from '@/napcat-onebot/index';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Peer } from 'napcat-core/types';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { GuildActionsExamples } from '@/napcat-onebot/action/example/GuildActionsExamples';

const PayloadSchema = Type.Object({
  guild_id: Type.String({ description: '频道ID / guild_id' }),
  channel_id: Type.String({ description: '子频道ID / channel_id' }),
  chat_type: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '频道会话类型，默认4，可传9' })),
  message_id: Type.Optional(Type.String({ description: '起始消息ID（支持短ID）' })),
  message_seq: Type.Optional(Type.String({ description: '起始消息序号（兼容旧字段）' })),
  count: Type.Number({ default: 20, description: '获取消息数量' }),
  reverse_order: Type.Boolean({ default: false, description: '是否反向排序' }),
  disable_get_url: Type.Boolean({ default: false, description: '是否禁用获取URL' }),
  parse_mult_msg: Type.Boolean({ default: true, description: '是否解析合并消息' }),
  quick_reply: Type.Boolean({ default: false, description: '是否快速回复' }),
  reverseOrder: Type.Boolean({ default: false, description: '是否反向排序(旧版本兼容)' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  messages: Type.Array(Type.Any(), { description: '消息列表' }),
}, { description: '频道历史消息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGuildMsgHistory extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGuildMsgHistory;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取频道历史消息';
  override actionDescription = '获取指定频道会话的历史聊天记录';
  override actionTags = ['频道接口'];
  override payloadExample = GuildActionsExamples.GetGuildMsgHistory.payload;
  override returnExample = GuildActionsExamples.GetGuildMsgHistory.response;

  async _handle (payload: PayloadType, _adapter: string, config: NetworkAdapterConfig): Promise<ReturnType> {
    const peer: Peer = {
      chatType: resolveGuildChatType(payload.chat_type),
      peerUid: payload.guild_id.toString(),
      guildId: payload.channel_id.toString(),
    };
    const cursor = payload.message_id?.toString() || payload.message_seq?.toString() || '0';
    const hasCursor = !(cursor === '' || cursor === '0');
    const startMsgId = hasCursor
      ? (MessageUnique.getMsgIdAndPeerByShortId(+cursor)?.MsgId ?? cursor)
      : '0';
    const msgList = hasCursor
      ? (await this.core.apis.MsgApi.getMsgHistory(peer, startMsgId, +payload.count, payload.reverse_order || payload.reverseOrder)).msgList
      : (await this.core.apis.MsgApi.getAioFirstViewLatestMsgs(peer, +payload.count)).msgList;
    if (msgList.length === 0) {
      throw new Error(`消息${cursor}不存在`);
    }
    await Promise.all(msgList.map(async msg => {
      msg.id = MessageUnique.createUniqueMsgId({
        guildId: msg.guildId ?? '',
        chatType: msg.chatType,
        peerUid: msg.peerUid,
      }, msg.msgId);
    }));
    const ob11MsgList = (await Promise.all(
      msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg, config.messagePostFormat, payload.parse_mult_msg, payload.disable_get_url, payload.quick_reply))
    )).filter((msg): msg is OB11Message => msg !== undefined);
    return { messages: ob11MsgList };
  }
}

export default GetGuildMsgHistory;
