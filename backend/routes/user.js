const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config.json");
const crypto = require("crypto");
const { randomUUID } = require("crypto");

const auth = require("../middleware/auth");

// Middleware: verify JWT
// async function auth(req, res, next) {
//   try {
//     const header = req.headers.authorization;
//     if (!header)
//       return res.status(401).json({ success: false, message: "No token" });

//     const token = header.split(" ")[1];
//     const decoded = jwt.verify(token, config.jwtSecret);
//     req.user = decoded; // { id, role, organization }

//     next();
//   } catch {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// }

// Middleware: admin-only
function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only" });
  next();
}

// Get users in same org
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ orgId: req.user.organization });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create user
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    // console.log(req)
    const {name,email,password,orgId,role}=req.body;
    const passwordHash = sha256(password);

     const user = await User.create({
      userId: randomUUID(),
      name: name,
      email: email,
      password: passwordHash,
      role: role || "member",
      orgId: orgId,
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) updateData.password = sha256(updateData.password);

    const user = await User.findOneAndUpdate(
      { userId: req.params.id, orgId: req.user.organization },
      updateData,
      { new: true }
    );

    if (!user)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete user
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      userId: req.params.id,
      orgId: req.user.organization,
    });

    if (!user)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const sha256 = (input) =>
  crypto.createHash("sha256").update(input, "utf8").digest("hex");

module.exports = router;
