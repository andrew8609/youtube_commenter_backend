const User = require("../modals/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");
const { uploadFiles } = require("../../uploadOn5centscdn");
const {
  sendVerificationCode,
  sendResetPasswordEmail,
} = require("../email/email");
const { uploadToCloudinary } = require("../helpers/CloudinaryHelper");

module.exports = {
  Query: {
    getUsers: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");
      try {
        return await User.find({});
      } catch (err) {
        throw new Error(err.message);
      }
    },
    getUser: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");
      try {
        return await User.findById(args.id);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    getUserByEmail: async (parent, args, context) => {
      try {
        console.log(args.email);
        return await User.findOne({ email: args.email });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    getCurrentUser: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");
      try {
        return await User.findOne({ _id: context.user.id });
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    registerUser: async (parent, args) => {
      let body = args;
      let profileImageUrl = "";
      if (args.base64 && args.base64.length) {
        const result = await uploadToCloudinary(args.base64);
        if(result && result.url) {
            profileImageUrl = result.url;
        }
      }

      try {
        body = {
          ...args,
          profile_image: profileImageUrl,
        };

        //check if the email already exsists or not
        let isUser = await User.findOne({ email: args.email });
        if (isUser) {
          throw new Error("User already exists");
        }

        //hash the password
        const hash = await bcrypt.hash(args.password, 13);
        let user = new User({ ...body, password: hash });
        user.save();

        sendVerificationCode(args.email, args.name);

        return body;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    activateUser: async (parent, args) => {
      try {
        console.log(args.token);
        const decodedToken = jwt.verify(args.token, process.env.JWT_SECRET);
        console.log(decodedToken);
        if (!decodedToken.user) {
          throw new Error("Authentication failed");
        }
        const user = await User.findById(decodedToken.user.id);
        if (!user) {
          throw new Error("User not found");
        }

        await User.findByIdAndUpdate(
          decodedToken.user.id,
          { $set: { is_activated: true, is_verified: true } },
          { new: true }
        );

        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    resetPassword: async (parent, args) => {
      try {
        let user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("Email does not exists");
        }
        //create payload for jwt
        const payload = {
          user: {
            id: user._id,
          },
        };

        //sign the token
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        sendResetPasswordEmail(args.email, user.name, token);

        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    loginUser: async (parent, args, context) => {
      try {
        //check whether email exists or not
        let user = await User.findOne({ email: args.email, role: args.role });
        if (!user) {
          throw new Error("Email does not exists");
        }

        await User.findOneAndUpdate(
          { email: args.email, role: args.role },
          {
            $set: {
              updated_at: Date.now(),
              last_signed_ip: context.ip.clientIp,
            },
          }
        );

        //check whether user activated
        if (!user.is_activated) {
          throw new Error("User is not activated");
        }

        //check the password
        if (!bcrypt.compareSync(args.password, user.password)) {
          throw new Error("Passwords not matched");
        }

        //create payload for jwt
        const payload = {
          user: {
            id: user._id,
          },
        };

        //sign the token
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return {
          token,
          user_id: user._id,
          email: user.email,
          name: user.name,
          profile_image: user.profile_image,
        };
      } catch (err) {
        throw new Error(err.message);
      }
    },
    changePassword: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");
      try {
        console.log(args);
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("User not found");
        }

        const confirm_old_password = await bcrypt.compare(
          args.old_password,
          user.password
        );

        if (!confirm_old_password) {
          throw new Error("Old password wrong");
        }

        //hash the password
        const passwordHash = bcrypt.hashSync(args.password, 13);

        await User.findOneAndUpdate(
          { email: args.email },
          {
            password: passwordHash,
          }
        );

        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    passwordReset: async (parent, args, context) => {
      try {
        const decodedToken = jwt.verify(args.token, process.env.JWT_SECRET);

        if (!decodedToken.user) {
          throw new Error("Authentication failed");
        }
        const user = await User.findById(decodedToken.user.id);
        if (!user) {
          throw new Error("User not found");
        }

        //hash the pass
        const passwordHash = bcrypt.hashSync(args.password, 13);

        await User.findByIdAndUpdate(decodedToken.user.id, {
          password: passwordHash,
        });

        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateUser: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");

      let body = args;
      let profleImageUrl = "";

      if (args.base64 && args.base64.length) {
        const result = await uploadToCloudinary(args.base64);
        if(result && result.url) {
            profleImageUrl = result.url;
        }
      }

      body = {
        ...args,
        profile_image: profleImageUrl,
      };

      try {
        const user = await User.findOneAndUpdate(
          {
            _id: context.user.id,
          },
          {
            $set: {
              ...body,
            },
          },
          { new: true }
        );

        const user1 = await User.findOne({ _id: context.user.id });

        return user1;
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },
    updateViewCount: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");

      try {
        const user = await User.findById(args.id);
        await User.findOneAndUpdate(
          {
            _id: args.id,
          },
          {
            $set: {
              view_count: user && user.view_count ? user.view_count + 1 : 1,
            },
          },
          { new: true }
        );

        const user1 = await User.findOne({ _id: args.id });

        return user1;
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },
    deleteUser: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");
      if (!args.id) return;

      try {
        const user = await User.findById(args.id);

        if (!user) {
          return new Error("User Not Found");
        }
        user.remove();

        const users = await User.find({});

        return users;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    followUser: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Authentication failed");

      try {
        let user = await User.findById(args.id);
        let userFollowing = await User.findById(context.user.id);

        if (!user || !userFollowing) {
          throw new Error("Not Found");
        }

        const followers = user.followers ? user.followers : [];
        const following = userFollowing.following
          ? userFollowing.following
          : [];

        if (!following.length) {
          await User.findOneAndUpdate(
            { _id: context.user.id },
            { $set: { following: [args.id] } },
            { new: true }
          );
        } else if (following.length && following.includes(args.id)) {
          const filterFollowing = following.filter(
            (item) => item.toString() !== args.id
          );
          await User.findOneAndUpdate(
            { _id: context.user.id },
            { $set: { following: filterFollowing } },
            { new: true }
          );
        } else if (following.length && !following.includes(args.id)) {
          following.push(args.id);

          await User.findOneAndUpdate(
            { _id: context.user.id },
            { $set: { following: following } },
            { new: true }
          );
        }

        if (!followers.length) {
          return await User.findOneAndUpdate(
            { _id: args.id },
            { $set: { followers: [context.user.id] } },
            { new: true }
          );
        } else if (followers.length && followers.includes(context.user.id)) {
          const filterFollowers = followers.filter(
            (item) => item.toString() !== context.user.id
          );
          return await User.findOneAndUpdate(
            { _id: args.id },
            { $set: { followers: filterFollowers } },
            { new: true }
          );
        } else if (followers.length && !followers.includes(context.user.id)) {
          followers.push(context.user.id);

          return await User.findOneAndUpdate(
            { _id: args.id },
            { $set: { followers: followers } },
            { new: true }
          );
        } else {
          return await User.findById(context.user.id);
        }
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
