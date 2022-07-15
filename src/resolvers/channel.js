const Channel = require('../modals/Channel');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
    Query: {
        getChannels: async (parent, args, context) => {
            try {
                return await Channel.find({});
            } catch(err) {
                throw new Error(err.message)
            }
            
        },
        getChannel: async (parent, args, context) => {
            try {
                return await Channel.findById(args.id);
            } catch(err) {
                throw new Error(err.message)
            }
        },
        getChannelByYoutubeChannelId: async (parent, args, context) => {
            try {
                console.log(args.id)
                return await Channel.findOne({youtube_channel_id: args.id});
            } catch(err) {
                throw new Error(err.message)
            }
        },
        getChannelByUserId: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                console.log(args.id)
                return await Channel.findOne({user_id: args.id});
            } catch(err) {
                throw new Error(err.message)
            }
        },
        // getFollowingChannels: async (parent, args, context) => {
        //     if(!context.user) throw new AuthenticationError('Authentication failed')
        //     try {
        //         console.log(context.user)
        //         return await Channel.find({user_id: context.user.id});
        //     } catch(err) {
        //         throw new Error(err.message)
        //     }
        // },
    },
    Mutation: {
        createChannel: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let channel = new Channel({...args});
                channel.save();
                return channel
            } catch (err) {
                throw new Error(err.message)
            }
        },
        deleteChannel: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;

            try {
                const channel = await Channel.findById(args.id) 
                
                if(!channel) {
                    return new Error("Channel Not Found")
                }
                channel.remove()

                const channels = await Channel.find({})
                console.log(channels)
                return channels;
            } catch(err) {
                throw new Error(err.message)
            }
        }
    }
}