const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const userProfileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UsersCollection',
      required: true,
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
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    is_whatsapp_enabled: {
      type: Boolean,
      default: false,
    },
    is_placed: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'user_profiles',
    timestamps: false,
  }
);

userProfileSchema.pre('save', function updateTimestamp(next) {
  this.updated_at = new Date();
  next();
});

userProfileSchema.plugin(toJSON);

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
