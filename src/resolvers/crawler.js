const Crawler = require('../modals/Crawler');
const { AuthenticationError } = require('apollo-server-express');
const User = require('../modals/User');

module.exports = {
    Query: {
        getCrawlerData: async (parent, args, context) => {
            try {
                return await Crawler.find({}).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }
        },
        getFollowingCrawledData: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            try {
                let data = []

                const user = await User.findById(context.user.id);

                if (args.page_no >= 0)
                    data = await Crawler.find({ role: "normal", title: { $regex: args.search, $options: "i" }, user_id: { $in: user.following } }).limit(20).skip(20 * args.page_no).populate("channel_id").populate("user_id");
                else
                    data = await Crawler.find({ role: "normal", title: { $regex: args.search, $options: "i" }, user_id: { $in: user.following } }).populate("channel_id").populate("user_id");

                return data;
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getCrawledNormalData: async (parent, args, context) => {
            try {
                return await Crawler.find({role: "normal"}).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getCrawledTrendingData: async (parent, args, context) => {
            try {
                return await Crawler.find({role: "normal"}).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getCrawledPostByYoutubeId: async (parent, args, context) => {
            try {
                console.log(args)
                return await Crawler.findOne({url: `https://www.youtube.com/embed/${args.id}`}).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }
        },
    },
    Mutation: {
        deleteCrawler: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            if (!args.id) return;

            try {
                const crawler = await Crawler.findById(args.id)

                if (!crawler) {
                    return new Error("Data Not Found")
                }
                crawler.remove()

                return await Crawler.find({}).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }
        }
    }
}