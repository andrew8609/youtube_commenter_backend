const Report = require('../modals/Report');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
    Query: {
        getReports: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let report = await Report.find({});
                return report;
            } catch (err) {
                throw err;
            }
        },
        getReport: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let report = await ReportfindById(args.id);
                return report;
            } catch (err) {
                throw err;
            }
        }
    },
    Mutation: {
        createReport: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let report = await Report({ ...args });
                return report.save();
            } catch (err) {
                throw err;
            }
        },
        deleteReport: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;
            try {
                let report = await Report.findById(args.id);
                if(!report) {
                    return new Error("Report Not Found")
                }
                report.remove()

                const reports = await Report.find({})
                return reports;
            } catch (err) {
                throw err;
            }
        }
    }
}