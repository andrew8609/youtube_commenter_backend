const CrawlerStatus = require('../modals/CrawlerStatus');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
    Query: {
        getCrawlerStatus: async (parent, args, context) => {
            try {
                return await CrawlerStatus.findOne({});
            } catch (err) {
                throw new Error(err.message)
            }

        }
    },
    Mutation: {
        createCrawlerStatus: async (parent, args, context) => {
            try {
                console.log("crawler")
                let crawlerStatus = new CrawlerStatus({ ...args });
                crawlerStatus.save();
                return crawlerStatus;
            } catch (err) {
                throw new Error(err.message)
            }
        },
        updateCrawlerStatus: async (parent, args, context) => {
            // if (!context.user) throw new AuthenticationError('Authentication failed')
    
            try {
                const crawlerStatus = await CrawlerStatus.findOneAndUpdate({}, {
                    $set: {
                        ...args
                    }
                }, {new: true})

                if (!crawlerStatus) {
                    return new Error("Data Not Found")
                }
                

                const crawlerData = await CrawlerStatus.findOne({})

                return crawlerData;
            } catch (err) {
                throw new Error(err.message)
            }
        }
    }
}