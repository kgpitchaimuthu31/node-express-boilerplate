const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const usersCollectionSchema = mongoose.Schema(
  {
    phone_number: {
      type: String,
      trim: true,
      index: true,
    },
    first_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    is_whatsapp_enabled: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    college: {
      type: String,
      trim: true,
    },
    is_placed: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
    },
  },
  {
    collection: 'Users_Collection',
    timestamps: false,
  }
);

usersCollectionSchema.plugin(toJSON);

const UsersCollection = mongoose.model('UsersCollection', usersCollectionSchema);

module.exports = UsersCollection;