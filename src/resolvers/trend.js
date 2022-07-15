const Post = require('../modals/Post');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
    Query: {
        getTrends: async (parent, args, context) => {
            try {
                let trends = []
                console.log(args)
                if(args.page_no >= 0)
                    trends =  await Post.find({role: "trend"}).sort({ created_at : -1}).limit(20).skip(20 * args.page_no).populate("channel_id").populate("user_id");
                else 
                    trends =  await Post.find({role: "trend"}).sort({ created_at : -1}).populate("channel_id").populate("user_id");

                return trends;
            } catch(err) {
                throw new Error(err.message)
            }
        },
        getTrend: async (parent, args, context) => {
            try {
                console.log(args)
                return await Post.findOne({_id: args.id}).populate("channel_id").populate("user_id");
            } catch(err) {
                throw new Error(err.message)
            }
        }
    },
    Mutation: {
        createTrend: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let trend = new Post({ ...args });
                return trend.save();
            } catch (err) {
                throw err;
            }
        },
        deleteTrend: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;

            try {
                const trend = await Post.findById(args.id)
                
                if(!trend) {
                    return new Error("Trend Not Found")
                }
                trend.remove()

                const trends = await Post.find({ role: "trend" })
       
                return trends;
            } catch(err) {
                throw new Error(err.message)
            }
        }
    }
}