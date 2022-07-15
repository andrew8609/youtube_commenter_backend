
const type = `
  type Comment {
    id: ID
    post_id: Post
    liked_by: [ID]
    url: String
    comment_by: ID
    like_count: Int
    type:String
    note: String
    aspect_ratio: String
    duration: String
    created_at: String
    updated_at: String
    page_no: Int
  }

  input Blob {
    size: Int
    result: String
  }

  input VideoBlobs {
    start: Int
    end: Int
    videoBlob: String!
  }

  type CommentCount {
    count: Int
  }
`

const query = `
  getComments: [Comment]
  getCommentsByUser(id: ID!): [Comment]
  getCommentsByPostID(id: ID!, skip: Int!, limit: Int!): [Comment]
  getComment(id: ID!): Comment
  getFollowingReactions(page_no: Int): [Comment]
  getCommentsCount(id: ID): CommentCount
`

const mutation = `
  createComment(post_id: ID!, videos: [VideoBlobs], totalDuration: Int, type: String!, note: String, aspect_ratio: String, duration: String): Comment
  likeOrUnlikeComment(id: ID!, liked_by: ID!, is_like: Boolean): Comment
  deleteComment(id: ID!): Comment
`

module.exports = { type, query, mutation }