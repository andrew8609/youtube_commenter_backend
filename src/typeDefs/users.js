
const type = `
  type User {
    id: ID
    name: String
    dob: String
    email: String
    password: String
    profile_image: String
    following: [ID]
    followers: [ID]
    is_activated: Boolean
    is_verified: Boolean
    last_signed_ip: String
    last_signed_date: String
    role: String
    view_count: Int
    updated_at: String
    created_at: String
  }
  type AuthData {
      user_id: ID
      email: String
      name: String
      token: String
      role: String
      profile_image: String
  }
`

const query = `
  getUsers: [User]
  getCurrentUser: User
  getUser(id: ID!): User
  getUserByEmail(email: String): User
`

const mutation = `
  registerUser(name: String, dob: String, email: String, password: String, is_activated: Boolean, is_verified: Boolean, role: String, base64: String, fileName: String, fileType: String): User
  loginUser(email: String!, password: String!, role: String!): AuthData!
  activateUser(token: String): User
  updateViewCount(id: ID!): User
  updateUser(name: String, dob: String, email: String, profile_image: String, last_signed_ip: String, last_signed_date: String, role: String, base64: String, fileName: String, fileType: String): User
  changePassword(old_password: String!, password: String!, email: String!): User
  resetPassword(email: String): User
  passwordReset(password: String!, token: String!): User
  deleteUser(id: ID!): [User]
  followUser(id: ID!): User
`

module.exports = { type, query, mutation }