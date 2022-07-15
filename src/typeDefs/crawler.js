
// const type = `
//     type Crawler {
//         id: ID
//         total_posts: Int
//         type: String
//         created_at: String
//     }
// `
type = `
    type Crawler {
        id: ID
        channel_id: Channel
        user_id: User
        thumbnail_url: String
        title: String
        url: String
        type:String
        view_count: Int
        like_count: Int
        dislike_count: Int
        aspect_ratio: String
        role: String
        liked_by: [ID]
        disliked_by: [ID]
        duration: String
        created_at: String
        last_updated: String
        posted_as: String
    }
`

const query = `
    getCrawledNormalData: [Crawler]
    getCrawledTrendingData: [Crawler]
    getCrawlerData: [Crawler]
    getCrawledPostByYoutubeId(id: String): Crawler
    getFollowingCrawledData(page_no: Int, search: String): [Crawler]
`

const mutation = `
    deleteCrawler(id: ID): [Crawler]
`

module.exports = { type, query, mutation }