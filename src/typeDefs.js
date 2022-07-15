const { gql } = require('apollo-server-express');

const typeDefs = gql `
   type User {
     id: ID!
     name: String!
     dob: String!
     email: String!
     phone: String!
     password: String!
     profile_image: String!
     is_activated: Boolean
     is_verified: Boolean
     last_signed_ip: String!
     last_signed_date: String!
     updated_at: String!
     created_at: String!
   }
   type AuthData {
       user_id: ID!
       email: String!
       name: String!
       token: String!
   }
   type Query {
     getUsers: [User]
     getUser(id: ID!): User
   }
   type Mutation {
     registerUser(name: String!, dob: String!, email: String!, phone: String!, password: String!,profile_image: String!, is_activated: Boolean, is_verified: Boolean, last_signed_ip: String!, last_signed_date: String!): AuthData!
     loginUser(email: String!, password: String!): AuthData!
     updateUser(name: String!, dob: String!, email: String!, password: String!,profile_image: String!, is_activated: Boolean, is_verified: Boolean, last_signed_ip: String!, last_signed_date: String!): User
     changePassword(old_password: String!, password: String!, email: String!): User
     deleteUser(id: ID!): User
   }
`

module.exports = typeDefs