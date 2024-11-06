// models/websiteModels/SiteUser.js
const mongoose = require('mongoose');

const SiteUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('SiteUser', SiteUserSchema);
