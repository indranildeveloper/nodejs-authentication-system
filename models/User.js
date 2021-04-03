const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please Enter an Email!"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter an Password!"],
    minlength: [7, "Minimum Password Length is 7 characters"],
  },
});

// Fire a function before doc saved to database
UserSchema.pre("save", async function (next) {
  // console.log("User about to be created and save", this);
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Static method for login user
UserSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect Password!");
  }
  throw Error("Incorrect Email!");
};

const User = mongoose.model("user", UserSchema);

module.exports = User;
