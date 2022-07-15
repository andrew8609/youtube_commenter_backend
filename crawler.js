const cron = require('node-cron');
const axios = require('axios')
const crawlData = require('./crawlerData.json')
const Post = require('./src/modals/Post')
const Channel = require('./src/modals/Channel')
const Crawler = require('./src/modals/Crawler');
const CrawlerStatus = require('./src/modals/CrawlerStatus');
const moment = require('moment');
const User = require('./src/modals/User');

const key = process.env.YOUTUBE_API;

// const createPost = (id, channel_id, user_id, role) => {
//     axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${process.env.YOUTUBE_API}`)
//     .then(async res => {
//         res.data.items.forEach(async item => {
//             const data = {
//                 title: item.snippet.title,
//                 user_id: user_id,
//                 channel_id: channel_id,
//                 thumbnail_url: item.snippet.thumbnails.medium.url,
//                 type: "video",
//                 role: role,
//                 url: `https://www.youtube.com/embed/${id}`,
//                 view_count: parseInt(item.statistics.viewCount),
//                 like_count: parseInt(item.statistics.likeCount),
//                 dislike_count: parseInt(item.statistics.dislikeCount),
//                 duration: item.contentDetails.duration,
//                 created_at: item.snippet.publishedAt
//             }

//             try {
//                 await Crawler.create(data)
//             } catch(err) {
//                 console.log("Post err")
//                 console.log(err.toString())
//             }
//         })
//     })
//     .catch(err => console.log(err.toString()))
// }

const saveCrawledData = async (item, user_id, channel_id) => {
    try {
        const data = {
            title: item.snippet.title,
            user_id: user_id,
            channel_id: channel_id,
            thumbnail_url: item.snippet.thumbnails.medium.url,
            type: "video",
            role: "trend",
            url: `https://www.youtube.com/embed/${item.id}`,
            view_count: parseInt(item.statistics.viewCount),
            like_count: parseInt(item.statistics.likeCount),
            dislike_count: parseInt(item.statistics.dislikeCount),
            duration: item.contentDetails.duration,
            created_at: item.snippet.publishedAt
        }
        
        await Crawler.create(data)
    } catch (err) {
        console.log(err.toString())
    }
}

const searchFromYoutubeAPI = async () => {
    let arr = []

    try {
        console.log(key)
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,id&chart=mostPopular&key=${key}&maxResults=50`)
        
        res.data.items.forEach(async (item, i) => {
            try {
                const channelDataRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${item.snippet.channelId}&key=${key}`)
                
                const user = await User.findOne({email: `${channelDataRes.data.items[0].customUrl}@wecept.com`})

                if(!user) {
                    const createUser = await User.create({name: item.snippet.channelTitle, dob: new Date(), email: `${channelDataRes.data.items[0].customUrl}@wecept.com`, is_activated: false, is_verified: false, password: "none", role: "user"})
                    const channel = await Channel.findOne({youtube_channel_id: item.snippet.channelId})
                    if(!channel) {
                        const createChannel = await Channel.create({title: item.snippet.channelTitle, description: channelDataRes.data.items[0].snippet.description, thumbnail_image_url: channelDataRes.data.items[0].snippet.thumbnails.medium.url, youtube_channel_id: item.snippet.channelId, user_id: createUser._id})
                        saveCrawledData(item, createUser._id, createChannel._id)
                    }
                } else {
                    const channel = await Channel.findOne({youtube_channel_id: item.snippet.channelId})
                    if(!channel) {
                        const createChannel = await Channel.create({title: item.snippet.channelTitle, description: channelDataRes.data.items[0].snippet.description, thumbnail_image_url: channelDataRes.data.items[0].snippet.thumbnails.medium.url, youtube_channel_id: item.snippet.channelId, user_id: user._id})
                        saveCrawledData(item, user._id, createChannel._id)
                    } else {
                        saveCrawledData(item, user._id, channel._id)
                    }
                }
                
            } catch(err) {
                console.log(err.toString())
            } 
        })
    } catch(err) {
        console.log(err.toString())
    }
}

// const createTrend = (youtube_channel_id, channel_id, user_id) => {
//     axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&chart=mostPopular&regionCode=us&key=${process.env.YOUTUBE_API}&channelId=${youtube_channel_id}`)
//     .then(res => {
//         console.log(res.data)
//         res.data.items.forEach(item => {
//             createPost(item.id.videoId, channel_id, user_id, "trend")
//         })
//     })
//     .catch(err => {
//         console.log("Trend err")
//         console.log(err.toString())
//     }) 
// }

// const getPlaylistItems = (id, channel_id, user_id, youtube_channel_id) => {
//     console.log("Channel id: ", channel_id)
//     axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${id}&key=${process.env.YOUTUBE_API}`)
//     .then(res => {
//         console.log(res.data)
//         res.data.items.forEach(async (item, i) => {
//             try {
//                 const findVideo = await Crawler.findOne({ url: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}` })
//                 console.log(findVideo)
//                 if(!findVideo) {
//                     createPost(item.snippet.resourceId.videoId, channel_id, user_id, "normal")
//                     createTrend(youtube_channel_id, channel_id, user_id)
//                 }
                
//                 // if(res.data.items.length - 1 === i){
//                 //     try {
//                 //         console.log("posts normal trend")
//                 //         var start = moment().startOf('day'); // set to 12:00 am today
//                 //         var end = moment().endOf('day'); // set to 23:59 pm today
//                 //         const findPostsNormal = await Post.find({created_at: { $gte: start, $lt: end }, type: "normal"})
//                 //         if(findPostsNormal.length) {
//                 //             await Crawler.create({total_posts: findPostsNormal.length, type: "Normal"})
//                 //         }
//                 //         const findPostsTrend = await Post.find({created_at: { $gte: start, $lt: end }, type: "trend"})
//                 //         if(findPostsTrend.length) {
//                 //             await Crawler.create({total_posts: findPostsTrend.length, type: "Trending"})
//                 //         }
//                 //     } catch(err) {
//                 //         console.log("Post err")
//                 //         console.log(err.toString())
//                 //     }
//                 // }
//             } catch(err) {
//                 console.log("getPlaylistItems1 err")
//                 console.log(err.toString())
//             }
//         })
        
//     })
//     .catch(err => {
//         console.log("getPlaylistItems2 err")
//         console.log(err.toString())
//     })
// }

// const getChannelDetail = async (youtube_channel_id, user_id, channel_id) => {
//     axios.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${youtube_channel_id}&key=${process.env.YOUTUBE_API}`)
//     .then(async res => {
//         try {
//             if(res.data.items)
//                 getPlaylistItems(res.data.items[0].contentDetails.relatedPlaylists.uploads, channel_id, user_id, youtube_channel_id)
//         } catch(err) {
//             console.log("getChannelDetail1 err")
//             console.log(err.toString())
//         }
//     })
//     .catch(err => {
//         console.log("getChannelDetail2 err")
//         console.log(err.toString())
//     })
// }

const crawler = async () => {
    // '0 0 * * *'
    cron.schedule('0 0 * * *', async function () {
        console.log('running at every 12 AM');
        try {
            const crawlerStatus = await CrawlerStatus.findOne({})
            if(!crawlerStatus) {
                throw new Error("Crawler status not found")
            } else if(crawlerStatus.is_on) {
                // crawlData.channels.forEach(async channel => {
                //     const findChannel = await Channel.findOne({youtube_channel_id: channel.youtube_channel_id})
                //     if(findChannel) {
                //         getChannelDetail(channel.youtube_channel_id, findChannel.user_id, findChannel._id);
                //     }
                // })   
                searchFromYoutubeAPI()
            }
        } catch(err) {
            console.log(err.toString())
        } 
    });
}

module.exports  = { crawler };