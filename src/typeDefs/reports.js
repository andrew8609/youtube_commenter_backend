
const type = `
  type Reports {
    id: ID
    type: String
    user_id: ID
    comment_id: ID
    reported_by: ID
    created_at: String
  }
`

const query = `
  getReports: [Reports]
  getReport(id: ID!): Reports
`

const mutation = `
  createReport(type: String, user_id: ID, comment_id: ID, reported_by: ID): Reports
  deleteReport(id: ID): [Reports]
`

module.exports = { type, query, mutation }