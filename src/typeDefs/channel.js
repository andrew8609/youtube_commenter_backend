
const type = `
  type Channel {
    id: ID
    title: String
    description: String
    thumbnail_image_url: String
    youtube_channel_id: String
    user_id: String
    created_at: String
  }
`

const query = `
  getChannels: [Channel]
  getChannel(id: ID!): Channel
  getChannelByYoutubeChannelId(id: String): Channel
  getChannelByUserId(id: String): Channel
`

const mutation = `
  createChannel(title: String, description: String, thumbnail_image_url: String, youtube_channel_id: String, user_id: String): Channel
  deleteChannel(id: ID!): [Channel]
`

module.exports = { type, query, mutation }