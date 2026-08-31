const mongoose = require('mongoose');
const crypto = require('crypto');

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    timeLimit: {
      type: Number, // duration in minutes
      required: true
    },
    allowedLanguages: {
      type: [String],
      default: ['javascript', 'python', 'cpp', 'java']
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft'
    },
    inviteToken: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID()
    },
    showResultsImmediately: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Assessment', AssessmentSchema);
