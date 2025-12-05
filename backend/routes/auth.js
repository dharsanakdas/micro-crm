const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const config = require("../config.json");
const { randomUUID } = require("crypto");

// -------------------------
// Utility: Generate JWT
// -------------------------
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: "6h" }
  );
}

/* ================================================================
   REGISTER USER
================================================================ */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, orgId } = req.body;

    if (!name || !email || !password || !role || !orgId) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, role, orgId are required",
      });
    }

    // Check if organization exists
    const orgExists = await Organization.findOne({ orgId });
    if (!orgExists) {
      return res.status(400).json({
        success: false,
        message: "Organization does not exist",
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      userId: randomUUID(),
      name,
      email,
      password: hashed,
      role,
      orgId,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.log("Register Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ================================================================
   LOGIN USER
================================================================ */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email,email)
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "email and password required",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ================================================================
   CREATE ORGANIZATION
================================================================ */

router.post("/organizations", async (req, res) => {
  try {
    console.log("test")
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    // Normalize slug if provided
    const cleanSlug = slug
      ? slug.toLowerCase().replace(/\s+/g, "-")
      : null;

    // orgId priority: slug → uuid
    const orgId = cleanSlug || randomUUID();

    const existing = await Organization.findOne({
      $or: [{ name }, { orgId }],
    });

    console.log(existing);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Organization already exists",
      });
    }

    const org = await Organization.create({
      name,
      orgId,
    });



    return res.status(201).json({
      success: true,
      message: "Organization created",
      data: {
        org: {
          id: org._id,
          name: org.name,
          orgId: org.orgId,
        },
      },
    });
  } catch (err) {
    console.error("Create org error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;

