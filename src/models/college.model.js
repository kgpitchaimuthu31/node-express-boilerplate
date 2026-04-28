const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const collegeSchema = mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    annaUniversityId: {
      type: String,
      trim: true,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    contactMobile: {
      type: String,
      trim: true,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'colleges',
    timestamps: false,
  }
);

collegeSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

collegeSchema.plugin(toJSON);
collegeSchema.plugin(paginate);

const College = mongoose.model('College', collegeSchema);

module.exports = College;
