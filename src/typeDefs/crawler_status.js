
const type = `
    type CrawlerStatus {
        id: ID
        is_on: Boolean
    }
`

const query = `
    getCrawlerStatus: CrawlerStatus
`

const mutation = `
    createCrawlerStatus(is_on: Boolean): CrawlerStatus
    updateCrawlerStatus(is_on: Boolean): CrawlerStatus
`

module.exports = { type, query, mutation }