const Comment = require('../modals/Comments');
const { AuthenticationError } = require('apollo-server-express');
const fs = require('fs')
const webmToMp4 = require("webm-to-mp4");
var cloudinary = require('cloudinary').v2;
const Post = require('../modals/Post');
const User = require('../modals/User');


const convert = (mergeArr, totalDuration, end, post_id, type, videos, user_id) => {
    let arr = []
    console.log(mergeArr)
    const sortArr = mergeArr.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    sortArr.forEach((item, i) => {
        if(videos[0].start !== 0) {
            if (item.image)
                arr.push(item.image, item.so);
            if(i !== 0)
                arr.push(item.video)
        } else {
            if(i !== 0)
                arr.push(item.video)
            if (item.image)
                arr.push(item.image, item.so);
        }
       

        if (i === sortArr.length - 1 || sortArr.length === 1) {
            console.log(totalDuration, end)
            if (totalDuration) {
                if (totalDuration - end !== 0) {
                    arr.push({ width: 200, height: 200, overlay: "overlay.jpg", flags: "splice", duration: (totalDuration - end).toString() }, { start_offset: "1", flags: "layer_apply" })
                }
            }
            cloudinary.uploader.upload(`${sortArr[0].name}`, {
                timeout: 6000000,
                resource_type: "video",
                width: 200, height: 200,
                transformation: [{ width: 200, height: 200, crop: "fill", quality: 50 }, ...arr],
            }, async (err, result) => {
                try {
                    if (err) {
                        return;
                    }
                   console.log(result)
                    await Comment.create({ post_id, type,  url: result.secure_url, comment_by: user_id, duration: totalDuration.toString()})
                    sortArr.forEach(item1 => {
                        fs.unlink(item1.name, (err) => {
                            if(err) {
                                return false
                            } 
                        })
                    }) 
                    return { id: "id", url: "", type: "" }
                } catch(err) {
                    throw err
                }
        
                
            })
        }
    })


}

module.exports = {
    Query: {
        getComments: async (parent, args, context) => {
            try {
                return await Comment.find({}).populate("post_id");
            } catch (err) {
                throw new Error(err.message)
            }

        },
        getCommentsCount: async (parent, args, context) => {
            try {
                const res = await Comment.countDocuments({ post_id: args.id })
                console.log(res)
                return { count: res };
            } catch(err) {
                throw new Error(err.message)
            }
        },
        getCommentsByPostID: async (parent, args, context) => {
            try {
                let skip = args.skip;
                let limit = args.limit
                
                const tempArr = []
                
                const res = await Post.findOne({ _id: args.id }).populate("user_id")
                const res1 = await Comment.find({ post_id: args.id }).sort({like_count: -1, created_at: -1}).populate("post_id");
    
                return res1.slice(skip, skip + limit);
                
            } catch (err) {
                console.log(err)
                throw new Error(err.message)
            }

        },
        getComment: async (parent, args, context) => {
            try {
                return await Comment.findById(args.id).populate("post_id");
            } catch (err) {
                throw new Error(err.message)
            }
        },
        getFollowingReactions: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let comments = []

                const user = await User.findById(context.user.id);
                
                if(args.page_no >= 0)
                    comments =  await Comment.find({comment_by: { $in: user.following }}).limit(20).skip(20 * args.page_no).populate("post_id");
                else 
                    comments =  await Comment.find({comment_by: { $in: user.following }}).populate("post_id");
                console.log(comments)
                return comments;
            } catch(err) {
                throw new Error(err.message)
            }
            
        },
        getCommentsByUser: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                const comments = await Comment.find({comment_by: args.id}).populate("post_id");
                console.log(comments)
                return comments
            } catch (err) {
                console.log(err)
                throw new Error(err.message)
            }
        }
    },
    Mutation: {
        createComment: (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
           
            let mergeArr = []
            
            args.videos.forEach((item, i) => {
                if (i === 0 && item.videoBlob && item.start !== 0) {
                    if (item.start - 1 !== 0) {
                        fs.writeFile(`video${i}${i}.mp4`, item.videoBlob.split(';base64,')[1], 'base64', (err, data) => {
                            if (err) {
                                return false
                            }

                            cloudinary.uploader.upload(`video${i}${i}.mp4`, { resource_type: "video", width: 200, height: 200,timeout: 6000000, transformation: [{ width: 200, height: 200, crop: "fill", quality: 50 }] }, (err, data) => {
                                console.log(data, err)
                                if (err) {
                                    return;
                                }
                                mergeArr.push({ name: `video${i}${i}.mp4`, image: { width: 200, height: 200, overlay: "overlay.jpg", flags: "splice", duration: (item.start - 1).toString() }, so: { start_offset: args.videos[0].start !== 0  ? "0" : "1", flags: "layer_apply" }, video: { width: 200, height: 200, overlay: `video:${data.public_id}`, flags: "splice", crop: "fill" } })

                                if (mergeArr.length === args.videos.length) {
                                    return convert(mergeArr, args.totalDuration, args.videos[args.videos.length - 1].end, args.post_id, args.type, args.videos, context.user.id)
                                }

                            })

                        })
                    } else {
                        fs.writeFile(`video${i}${i}.mp4`, item.videoBlob.split(';base64,')[1], 'base64', (err, data) => {
                            if (err) {
                                return false
                            }

                            cloudinary.uploader.upload(`video${i}${i}.mp4`, { resource_type: "video",timeout: 6000000, width: 200, height: 200, transformation: [{ width: 200, height: 200, crop: "fill", quality: 50 }] }, (err, data) => {
                                console.log(data, err)
                                if (err) {
                                    return;
                                }
                                mergeArr.push({ name: `video${i}${i}.mp4`, video: { width: 200, height: 200, overlay: `video:${data.public_id}`, flags: "splice", crop: "fill" } })
                                if (mergeArr.length === args.videos.length) {
                                    return convert(mergeArr, args.totalDuration, args.videos[args.videos.length - 1].end, args.post_id, args.type, args.videos, context.user.id)
                                }

                            })

                        })
                    }
                } else if (item.videoBlob) {
                    if (args.totalDuration - item.end !== 0) {

                        fs.writeFile(`video${i}${i}.mp4`, item.videoBlob.split(';base64,')[1], 'base64', (err, data) => {
                            if (err) {
                                return false
                            }

                            if (args.videos[0].start !== 0) {

                                cloudinary.uploader.upload(`video${i}${i}.mp4`, { resource_type: "video", width: 200, height: 200,timeout: 6000000, transformation: [{ width: 200, height: 200, crop: "fill", quality: 50 }] }, (err, data) => {
                                    console.log(data, err)
                                    if (err) {
                                        return;
                                    }
                                    mergeArr.push({ name: `video${i}${i}.mp4`, image: { width: 200, height: 200, overlay: "overlay.jpg", flags: "splice", duration: (args.videos[i + 1] ? args.videos[i + 1].start - item.end : item.end < args.totalDuration ? args.totalDuration - item.end : 0).toString() }, so: { start_offset: args.videos[0].start !== 0 ? "0" : "1", flags: "layer_apply" }, video: { width: 200, height: 200, overlay: `video:${data.public_id}`, flags: "splice", crop: "fill" } })
                                    if (mergeArr.length === args.videos.length) {
                                        return convert(mergeArr, args.totalDuration, args.videos[args.videos.length - 1].end, args.post_id, args.type, args.videos, context.user.id)
                                    }

                                })

                            } else {
                                cloudinary.uploader.upload(`video${i}${i}.mp4`, { resource_type: "video", width: 200, height: 200,timeout: 6000000, transformation: [{ width: 200, height: 200, crop: "fill", quality: 50 }] }, (err, data) => {
                                    console.log(data, err)
                                    if (err) {
                                        return;
                                    }
                                    mergeArr.push({ name: `video${i}${i}.mp4`, image: { width: 200, height: 200, overlay: "overlay.jpg", flags: "splice", duration: (args.videos[i + 1] ? args.videos[i + 1].start - item.end : item.end < args.totalDuration ? args.totalDuration - item.end : 0).toString() }, so: { start_offset: args.videos[0].start !== 0 ? "0" : "1", flags: "layer_apply" }, video: { width: 200, height: 200, overlay: `video:${data.public_id}`, flags: "splice", crop: "fill" } })
                                    if (mergeArr.length === args.videos.length) {
                                        return convert(mergeArr, args.totalDuration, args.videos[args.videos.length - 1].end, args.post_id, args.type, args.videos, context.user.id)
                                    }

                                })

                            }
                        })
                    } else {
                        fs.writeFile(`video${i}${i}.mp4`, item.videoBlob.split(';base64,')[1], 'base64', (err, data) => {
                            if (err) {
                                return false
                            }

                            cloudinary.uploader.upload(`video${i}${i}.mp4`, { resource_type: "video", width: 200, height: 200,timeout: 6000000, transformation: [{ width: 200, height: 200, crop: "fill", quality: 50 }] }, (err, data) => {
                                if (err) {
                                    return;
                                }
                                mergeArr.push({ name: `video${i}${i}.mp4`, video: { width: 200, height: 200, overlay: `video:${data.public_id}`, flags: "splice", crop: "fill" } })
                               
                                if (mergeArr.length === args.videos.length) {
                                    return convert(mergeArr, args.totalDuration, args.videos[args.videos.length - 1].end, args.post_id, args.type, args.videos, context.user.id)
                                }

                            })
                        })
                    }
                }
            })
        },
        likeOrUnlikeComment: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            if (!args.id) return;
            try {
                let comment = await Comment.findById(args.id);

                if (!comment) {
                    throw new Error("Not Found")
                }
                if ((!comment.liked_by.length) && args.is_like) {
                    return await Comment.findOneAndUpdate({ _id: args.id }, { $set: { liked_by: [args.liked_by], like_count: comment.like_count + 1 } }, { new: true }).populate("post_id");
                } else if (comment.liked_by.length && args.is_like) {
                    const likedComments = comment.liked_by;
                    likedComments.push(args.liked_by)
                    return await Comment.findOneAndUpdate({ _id: args.id }, { $set: { liked_by: likedComments, like_count: comment.like_count + 1 } }, { new: true }).populate("post_id");
                } else if (!args.is_like) {
                    const unlikeComments = comment.liked_by.filter(item => item.toString() !== args.liked_by.toString());

                    return await Comment.findOneAndUpdate({ _id: args.id }, { $set: { liked_by: unlikeComments, like_count: comment.like_count - 1 } }, { new: true }).populate("post_id");
                } else {
                    return await Comment.findById(comment._id).populate("post_id");
                }
            } catch (err) {
                throw new Error(err.message)
            }
        },
        deleteComment: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Authentication failed')
            if (!args.id) return;

            try {
                const comment = await Comment.findById(args.id).populate("post_id")

                if (!comment) {
                    return new Error("Comment Not Found")
                }
                comment.remove()

                const comments = await Comment.find({ }).populate("post_id")

                return comments;
            } catch (err) {
                throw new Error(err.message)
            }
        }
    }
}
