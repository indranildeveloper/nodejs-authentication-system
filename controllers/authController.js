const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Handle Errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // Incorrect Email
  if (err.message === "Incorrect Email!") {
    errors.email = "That email is not registered!";
  }
  // Incorrect Password
  if (err.message === "Incorrect Password!") {
    errors.password = "That password is incorrect!";
  }

  // Duplicate error code
  if (err.code === 11000) {
    errors.email = "That Email is already registered!";
    return errors;
  }

  // Validation Errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
// JWT create token
const cretaeToken = (id) => {
  return jwt.sign({ id }, "the net ninja tutorial secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({
      email,
      password,
    });
    const token = cretaeToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.login(email, password);
    const token = cretaeToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
