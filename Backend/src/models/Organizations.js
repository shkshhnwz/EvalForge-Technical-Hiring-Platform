const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    plan: {
      type: String,
      enum: ['free', 'growth', 'enterprise'],
      default: 'free'
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Organization', OrganizationSchema);
