const Post = require('../modals/Post');
const { AuthenticationError } = require('apollo-server-express');
const User = require('../modals/User');

module.exports = {
    Query: {
        getPosts: async (parent, args, context) => {
            try {
                let posts = []
                
                if (args && !args.posted_as) {
                    if (args.page_no >= 0)
                        posts = await Post.find({ role: "normal", title: { $regex: args.search, $options: "i" } }).sort({ created_at : -1}).limit(20).skip(20 * args.page_no).populate("channel_id").populate("user_id");
                    else
                        posts = await Post.find({ role: "normal", title: { $regex: args.search, $options: "i" } }).sort({ created_at : -1}).populate("channel_id").populate("user_id");
                   
                } else {
                    if (args.page_no >= 0)
                        posts = await Post.find({ role: "normal", posted_as: "self" }).sort({ created_at : -1}).limit(20).skip(20 * args.page_no).populate("channel_id").populate("user_id");
                    else
                        posts = await Post.find({ role: "normal", posted_as: "self" }).sort({ created_at : -1}).populate("channel_id").populate("user_id");
                }
             
                return posts;
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getFollowingPosts: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            try {
                let posts = []

                const user = await User.findById(context.user.id);

                if (args.page_no >= 0)
                    posts = await Post.find({ role: "normal", title: { $regex: args.search, $options: "i" }, user_id: { $in: user.following } }).limit(20).skip(20 * args.page_no).populate("channel_id").populate("user_id");
                else
                    posts = await Post.find({ role: "normal", title: { $regex: args.search, $options: "i" }, user_id: { $in: user.following } }).populate("channel_id").populate("user_id");

                return posts;
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getPostsByChannel: async (parent, args, context) => {
            try {
                return await Post.find({ role: "normal", channel_id: args.id }).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getPostsByUser: async (parent, args, context) => {
            try {
                const post = await Post.find({ role: "normal", user_id: args.id }).populate("channel_id").populate("user_id");
                return post
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getPost: async (parent, args, context) => {
            try {
                if(args.id && args.id.length > 0)
                    return await Post.findOne({_id: args.id.toString()}).populate("channel_id").populate("user_id");
                else
                    return null
            } catch (err) {
                console.log(err.toString())
                throw new Error(err.message)
            }
        },
        getPostByYoutubeId: async (parent, args, context) => {
            try {
                console.log(args)
                return await Post.findOne({url: `https://www.youtube.com/embed/${args.id}`}).populate("channel_id").populate("user_id");
            } catch (err) {
                throw new Error(err.message)
            }
        },
    },
    Mutation: {
        createPost: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let post = new Post({ ...args });
                post.save();
                return {id: post._id}
            } catch (err) {
                throw new Error(err.message)
            }
        },
        likeOrDislikePost: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            if (!args.id) return;
            try {
                let post = await Post.findById(args.id);

                if (!post) {
                    throw new Error("Not Found")
                }

                if (args.is_like !== null) {

                    if ((!post.liked_by.length) && args.is_like) {
                        const dislike_post = post.disliked_by.filter(item => item.toString() !== args.liked_by.toString());

                        return await Post.findOneAndUpdate({ _id: args.id }, { $set: { liked_by: [args.liked_by], disliked_by: dislike_post, like_count: post.like_count + 1, dislike_count: post.dislike_count - 1 } }, { new: true }).populate("channel_id").populate("user_id");
                    } else if (post.liked_by.length && args.is_like) {
                        const likedPosts = post.liked_by;
                        likedPosts.push(args.liked_by)

                        const dislike_post = post.disliked_by.filter(item => item.toString() !== args.liked_by.toString());

                        return await Post.findOneAndUpdate({ _id: args.id }, { $set: { liked_by: likedPosts, disliked_by: dislike_post, like_count: post.like_count + 1, dislike_count: post.dislike_count - 1 } }, { new: true }).populate("channel_id").populate("user_id");
                    } else if (!args.is_like) {
                        const unlikePosts = post.liked_by.filter(item => item.toString() !== args.liked_by.toString());

                        return await Post.findOneAndUpdate({ _id: args.id }, { $set: { liked_by: unlikePosts, like_count: post.like_count - 1 } }, { new: true }).populate("channel_id").populate("user_id");
                    } else {
                        return await Post.findById(post._id).populate("channel_id").populate("user_id");
                    }
                } else if (args.is_dislike !== null) {

                    if ((!post.disliked_by.length) && args.is_dislike) {
                        const like_post = post.liked_by.filter(item => item.toString() !== args.liked_by.toString());
                        return await Post.findOneAndUpdate({ _id: args.id }, { $set: { disliked_by: [args.liked_by], liked_by: like_post, like_count: post.like_count - 1, dislike_count: post.dislike_count + 1 } }, { new: true }).populate("channel_id").populate("user_id");
                    } else if (post.disliked_by.length && args.is_dislike) {
                        const like_post = post.liked_by.filter(item => item.toString() !== args.liked_by.toString());
                        const likedPosts = post.disliked_by;
                        likedPosts.push(args.liked_by)
                        return await Post.findOneAndUpdate({ _id: args.id }, { $set: { disliked_by: likedPosts, liked_by: like_post, like_count: post.like_count - 1, dislike_count: post.dislike_count + 1 } }, { new: true }).populate("channel_id").populate("user_id");
                    } else if (!args.is_dislike) {
                        const unlikePosts = post.disliked_by.filter(item => item.toString() !== args.liked_by.toString());

                        return await Post.findOneAndUpdate({ _id: args.id }, { $set: { disliked_by: unlikePosts, dislike_count: dislike_count - 1 } }, { new: true }).populate("channel_id").populate("user_id");
                    } else {
                        return await Post.findById(post._id).populate("channel_id").populate("user_id");
                    }
                } else {
                    return await Post.findById(post._id).populate("channel_id").populate("user_id");
                }
            } catch (err) {
                console.log(err)
                throw new Error(err.message)
            }
        },
        deletePost: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            if (!args.id) return;

            try {
                const post = await Post.findById(args.id).populate("channel_id").populate("user_id")

                if (!post) {
                    return new Error("Post Not Found")
                }
                post.remove()

                const posts = await Post.find({ role: "trend" }).populate("channel_id").populate("user_id")

                return posts;
            } catch (err) {
                throw new Error(err.message)
            }
        }
    }
}