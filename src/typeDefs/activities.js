
const type = `
  type Activities {
    id: ID!
    type: String!
    user_id: ID!
    created_at: String!
  }
`

const query = `
  getActivities: [Activities]
  getActivity(id: ID!): Activities
`

const mutation = `
  createActivity(type: String!, user_id: ID!): Activities
  updateActivity(id: ID!, type: String, user_id: ID): Activities
  deleteActivity(id: ID!): Activities
`

module.exports = { type, query, mutation }