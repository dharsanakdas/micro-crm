const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Contact = require("../models/Contacts");
const User = require("../models/User");
const config = require("../config.json");
const auth = require("../middleware/auth");

const { randomUUID } = require("crypto");

// GET all contacts for org
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ orgId: req.user.organization });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new contact
router.post("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    const contact = await Contact.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || "",
      notes: req.body.notes || "",
      orgId: req.user.organization,
      createdBy: req.user.id,
      contactId: randomUUID(),
    });

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update contact
router.put("/:id", auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { contactId: req.params.id, orgId: req.user.organization }, // tenant isolation
      req.body,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete contact
router.delete("/:id", auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      contactId: req.params.id,
      orgId: req.user.organization,
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
