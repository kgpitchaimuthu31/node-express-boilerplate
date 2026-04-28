const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const usersCollectionSchema = mongoose.Schema(
  {
    phone_number: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password_hash: {
      type: String,
      trim: true,
      private: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'college_admin', 'dept_admin', 'student', 'recruiter'],
      default: 'student',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    jwt: {
      type: String,
      trim: true,
      private: true,
    },
    access_token: {
      type: String,
      trim: true,
      private: true,
    },
    access_token_expires_at: {
      type: Date,
      private: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    last_login_at: {
      type: Date,
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
      index: true,
    },
  },
  {
    collection: 'users',
    timestamps: false,
  }
);

usersCollectionSchema.plugin(toJSON);

const UsersCollection = mongoose.model('UsersCollection', usersCollectionSchema);

module.exports = UsersCollection;
