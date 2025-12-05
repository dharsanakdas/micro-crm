const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config.json")

module.exports = async function auth(req, res, next) {
  try {

    console.log("Auth mid")
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ success: false, message: "No token provided" });

    const token = header.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ success: false, message: "Invalid token" });

    // verify JWT
    const decoded = jwt.verify(token, config.jwtSecret);

    // console.log(decoded);
    // find user from DB
    const user = await User.findOne({userId:decoded.userId});
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // attach required fields to request object
    req.user = {
      id: user._id,
      userId:user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      
      organization: user.orgId   // <-- your field
    };

    return next();
  } catch (err) {
    console.log("Auth error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
