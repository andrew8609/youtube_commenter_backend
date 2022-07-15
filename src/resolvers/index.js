const userResolver = require('./users');
const activitiesResolver = require('./activities');
const channelResolver = require('./channel');
const commentsResolver = require('./comments');
const postResolver = require('./post');
const trendResolver = require('./trend');
const reportResolver = require('./reports')
const crawlerResolver = require('./crawler')
const crawlerStatusResolver = require('./crawler_status')

const rootResolver = {
  Query: {
    ...userResolver.Query,
    ...activitiesResolver.Query,
    ...channelResolver.Query,
    ...commentsResolver.Query,
    ...postResolver.Query,
    ...trendResolver.Query,
    ...reportResolver.Query,
    ...crawlerResolver.Query,
    ...crawlerStatusResolver.Query
  },
  Mutation: {
    ...userResolver.Mutation,
    ...activitiesResolver.Mutation,
    ...channelResolver.Mutation,
    ...commentsResolver.Mutation,
    ...postResolver.Mutation,
    ...trendResolver.Mutation,
    ...reportResolver.Mutation,
    ...crawlerResolver.Mutation,
    ...crawlerStatusResolver.Mutation
  }
};

module.exports = rootResolver;