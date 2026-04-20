export const GuildActionsExamples = {
  GetGuildList: {
    payload: {},
    response: [{ guild_id: '123456', guild_name: '测试频道' }],
  },
  GetGuildProfile: {
    payload: { guild_id: '123456' },
    response: { guild_id: '123456', guild_name: '测试频道', guild_display_id: '123' },
  },
  SendGuildMsg: {
    payload: {
      guild_id: '123456',
      channel_id: '654321',
      message: 'hello guild',
    },
    response: { message_id: 123456 },
  },
  GetGuildMsgHistory: {
    payload: {
      guild_id: '123456',
      channel_id: '654321',
      count: 20,
    },
    response: {
      messages: [
        {
          message_id: 123456,
          message_type: 'guild',
          guild_id: '123456',
          channel_id: '654321',
        },
      ],
    },
  },
};
