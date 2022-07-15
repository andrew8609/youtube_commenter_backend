const { gql } = require('apollo-server-express');
const Users = require('./users');
const Activities = require('./activities');
const Channel = require('./channel');
const Comments = require('./comments');
const Post = require('./post');
const Report = require('./reports')
const Crawler = require('./crawler')
const CrawlerStatus = require('./crawler_status')

const types = [];
const queries = [];
const mutations = [];
const schemas = [Users, Activities, Channel, Comments, Post, Report, Crawler, CrawlerStatus];

schemas.forEach(schema => {
    types.push(schema.type);
    queries.push(schema.query);
    mutations.push(schema.mutation);
})

const rootTypeDefs = gql`

    ${types.join('\n')}

    type Query {
        ${queries.join('\n')}
    }

    type Mutation {
        ${mutations.join('\n')}
    }
`

module.exports = rootTypeDefs;