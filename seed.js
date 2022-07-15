const seedData = require('./seedData.json');
const User = require('./src/modals/User');
const Channel = require('./src/modals/Channel')
const Post = require('./src/modals/Post')
const axios = require('axios');
const Crawler = require('./src/modals/Crawler');

const seed = async () => {
    try {
        const userConstant = {
            dob: "none",
            email: "none",
            phone: "none",
            password: "none",
            profile_image: "",
            is_activated: false,
            is_verified: false,
            last_signed_ip: "none",
        }

        seedData.users.forEach(async item => {
            try {
                const user = await User.create({ ...userConstant, name: item.name, email: item.name + "@wecept.com" })
                console.log("Database seed successful")
        
                item.channels.forEach(item1 => {
                    createChannel(item1.youtube_channel_id, user._id);
                })
            } catch(err) {
                console.log(err.message)
                if(err.toString().includes("duplicate key error")) {
                    return;
                }
            }
        })
    } catch(err) {
        console.log(err.toString())
    }
}

const createChannel = async (id, user_id) => {
    axios.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${id}&key=${process.env.YOUTUBE_API}`)
    .then(async res => {
        try {
            const channel = await Channel.create({
                youtube_channel_id: id,
                user_id,
                title: res.data.items[0].snippet.title,
                description: res.data.items[0].snippet.description,
                thumbnail_image_url: res.data.items[0].snippet.thumbnails.medium.url,
            })
            getPlaylistItems(res.data.items[0].contentDetails.relatedPlaylists.uploads, channel._id, user_id)
            const findVideo = await Crawler.findOne({ url: `https://www.youtube.com/embed/${id}` })
            if(!findVideo) {
                createTrend(id, user_id)
            }
        } catch(err) {
            console.log(err)
        }
    })
    .catch(err => console.log(err))
}

const getPlaylistItems = (id, channel_id, user_id) => {
    axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${id}&key=${process.env.YOUTUBE_API}`)
    .then(res => {
        res.data.items.forEach(item => {
            createPost(item.snippet.resourceId.videoId, channel_id, user_id, "normal")
        })
        
    })
    .catch(err => console.log(err))
}

const createPost = (id, channel_id, user_id, role) => {
    
    axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${process.env.YOUTUBE_API}`)
    .then(async res => {
        res.data.items.forEach(async item => {
            const data = {
                title: item.snippet.title,
                user_id: user_id,
                channel_id: channel_id,
                thumbnail_url: item.snippet.thumbnails.medium.url,
                type: "video",
                role: role,
                url: `https://www.youtube.com/embed/${id}`,
                view_count: item.statistics.viewCount ? parseInt(item.statistics.viewCount) : 0,
                like_count: item.statistics.likeCount ? parseInt(item.statistics.likeCount) : 0,
                dislike_count: item.statistics.dislikeCount ? parseInt(item.statistics.dislikeCount) : 0,
                duration: item.contentDetails.duration,
                created_at: item.snippet.publishedAt
            }
            
            try {
                const findPost = await Crawler.findOne({url: data.url})
                if(!findPost){
                    await Crawler.create(data)
                }
            } catch(err) {
                console.log(err.toString())
            }
        })
    })
    .catch(err => console.log(err))
}

const createTrend = async (channel_id, user_id) => {
    try {
        const findChannel = await Channel.findOne({youtube_channel_id: channel_id})
        if(findChannel) {
            axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&chart=mostPopular&regionCode=us&key=${process.env.YOUTUBE_API}&channelId=${channel_id}`)
            .then(res => {
                res.data.items.forEach(item => {
                    createPost(item.id.videoId, findChannel._id, user_id, "trend")
                })
            })
            .catch(err => {
                console.log(err)
            })
        }
    } catch(err) {
        console.log(err)
    }
}

module.exports = { seed };