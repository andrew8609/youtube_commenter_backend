const User = require('./modals/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        getUsers: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            return User.find({});
        },
        getUser: (parent, args, context) => {
            // if(!context.user) throw new AuthenticationError('Authentication failed') 
            return User.findById(args.id);
        }
    },
    Mutation: {
        registerUser: async (parent, args) => {
            try {
                //check if the email already exsists or not
                let isUser = await User.findOne({ email: args.email });
                if (isUser) {
                    throw new Error("User already exists");
                }

                //hash the password
                const hash = await bcrypt.hash(args.password, 13);
                let user = new User({ ...args, password: hash });
                user.save();
                //create the jwt payload
                const jwtPaylaod = {
                    user: {
                        id: user._id,
                    },
                };

                //sign the token
                const token = jwt.sign(jwtPaylaod, process.env.JWT_SECRET, { expiresIn: '1d' });

                return { token, user_id: user._id, email: user.email, name: user.name };
            } catch (err) {
                throw err;
            }
        },
        loginUser: async (parent, args) => {
            try {
                //check whether email exists or not
                let user = await User.findOne({ email: req.body.email });
                if (!user) {
                    throw new Error("Email does not exists")
                }

                //check the password
                if (!bcrypt.compareSync(req.body.password, user.password)) {
                    throw new Error("Passwords do not match")
                }

                //create payload for jwt
                const payload = {
                    user: {
                        id: user._id,
                    },
                };

                //sign the token
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

                return { token, user_id: user._id, email: user.email, name: user.name };
            } catch (err) {
                throw err
            }
        },
        changePassword: async (parent, args, context) => {
            try {
                if(!context.user) throw new AuthenticationError('Authentication failed') 
                const user = await User.findById(args.email);
                if (!user) {
                    throw new Error('User not found');
                }

                const confirm_old_password = await bcrypt.compare(
                    args.old_password,
                    user.password
                );

                if (!confirm_old_password) {
                    throw new Error('Old password wrong');
                }

                //hash the password
                const passwordHash = bcrypt.hashSync(args.password, 13);

                await User.findByIdAndUpdate(args.id, {
                    password: passwordHash,
                });

                return true;
            } catch (err) {
                throw err
            }
        },
        updateUser: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;
            return User.findOneAndUpdate(
                {
                    _id: args.id
                },
                {
                    $set: {
                        ...args
                    }
                }, { new: true }, (err, User) => {
                    if (err) {
                        console.log('Something went wrong when updating the user');
                    } else {
                    }
                }
            );
        },
        deleteUser: (parent, args, context) => {
            if(!context.user) throw new AuthenticationError('Authentication failed') 
            if (!args.id) return;
            return User.findOneAndDelete(
                {
                    _id: args.id
                }, (err, User) => {
                    if (err) {
                        console.log('Something went wrong when updating the user');
                    } else {
                    }
                }
            );
        }
    }
}

module.exports = resolvers