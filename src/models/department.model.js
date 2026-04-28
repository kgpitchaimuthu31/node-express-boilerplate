const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const departmentSchema = mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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
    collection: 'departments',
    timestamps: false,
  }
);

departmentSchema.index({ collegeId: 1, code: 1 }, { unique: true });

departmentSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

departmentSchema.plugin(toJSON);

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
