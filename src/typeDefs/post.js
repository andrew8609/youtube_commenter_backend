
const type = `
  type Post {
    id: ID
    channel_id: Channel
    user_id: User
    thumbnail_url: String
    title: String
    url: String
    type:String
    view_count: Int
    like_count: Int
    dislike_count: Int
    aspect_ratio: String
    role: String
    liked_by: [ID]
    disliked_by: [ID]
    duration: String
    created_at: String
    last_updated: String
    posted_as: String
  }
`

const query = `
  getPosts(page_no: Int, search: String, posted_as: String): [Post]
  getPostss: [Post]
  getFollowingPosts(page_no: Int, search: String): [Post]
  getPost(id: String): Post
  getTrends(page_no: Int): [Post]
  getTrend(id: ID!): Post
  getPostByYoutubeId(id: String): Post
  getPostsByChannel(id: String!): [Post]
  getPostsByUser(id: ID!) : [Post]
`

const mutation = `
  createPost(channel_id: ID, user_id: ID, thumbnail_url: String, title: String, url: String, type:String, view_count: Int, like_count: Int, dislike_count: Int, aspect_ratio: String, duration: String, role: String, posted_as: String, created_at: String): Post
  likeOrDislikePost(id: ID!, liked_by: ID!, is_like: Boolean, is_dislike: Boolean): Post
  deletePost(id: ID!): [Post]
  createTrend(channel_id: ID!, user_id: ID!, thumbnail_url: String!, title: String!, url: String!, type:String!, view_count: Int, like_count: Int, dislike_count: Int, aspect_ratio: String, duration: String, role: String): Post
  deleteTrend(id: ID!): [Post]
`

module.exports = { type, query, mutation }