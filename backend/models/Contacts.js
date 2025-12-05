const mongoose = require("mongoose");

const contactsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },

    orgId: {
      type: String,
      required: true,
    }, 

    createdBy: {
      type: String, // store userId
      required: true,
    },
    contactId:{
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contacts", contactsSchema);
