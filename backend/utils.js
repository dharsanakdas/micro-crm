const jwt = require('jsonwebtoken');
const config = require('./config.json');
const User = require('./models/User');   // <-- use real DB model

// UTILS

const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Protected route, Bearer token not found",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify Token
    const payload = jwt.verify(token, config.jwtSecret);

    // Find user from DB instead of static USERS
    const user = await User.findOne({ username: payload.username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token or user no longer exists",
      });
    }

    req.user = user; // attach DB user
    next();

  } catch (err) {
    console.log(err);

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Bad or expired token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleError = (res, err) => {
  console.log(err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Check backend logs'
  });
};

module.exports = {
  verifyAuth,
  handleError
};
