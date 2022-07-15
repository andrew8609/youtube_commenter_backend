const mongoose = require("mongoose");
const { seed } = require("../../seed");

//Connecting DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    // await seed()
    console.log("Connected to DB");
  } catch (err) {
      console.log(err.toString())
    console.error("Unable to connect with DB.");
    process.exit(1);
  }
};

module.exports = connectDB;
