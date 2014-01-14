var mongoose = require('mongoose');

exports.userSchema = new mongoose.Schema({
  name: {
  first_name: { type: String, required: true},
  last_name: { type: String, required: true}
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  access_token: { type: String, required: true},
  role: { type: String, required: true},
  city: { type: String, required: true}
});

// exports.UserSchema = mongoose.model('User', userSchema);