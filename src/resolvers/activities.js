const Activity = require('../modals/Activities');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
    Query: {
        getActivities: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            return Activity.find({});
        },
        getActivity: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            return Activity.findById(args.id);
        }
    },
    Mutation: {
        createActivity: async (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            try {
                let activity = new Activity({ ...args, password: hash });
                return activity.save();
            } catch (err) {
                throw err;
            }
        },
        updateActivity: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;
            return Activity.findOneAndUpdate(
                {
                    _id: args.id
                },
                {
                    $set: {
                        ...args
                    }
                }, { new: true }, (err, Activity) => {
                    if (err) {
                        console.log('Something went wrong when updating the activity');
                    } else {
                    }
                }
            );
        },
        deleteActivity: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;
            return Activity.findOneAndDelete(
                {
                    _id: args.id
                }, (err, Activity) => {
                    if (err) {
                        console.log('Something went wrong when deleting the activity');
                    } else {
                    }
                }
            );
        }
    }
}