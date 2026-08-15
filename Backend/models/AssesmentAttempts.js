const mongoose = require('mongoose');

const AssessmentAttemptSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date
    },
    totalScore: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number
    },
    status: {
      type: String,
      enum: ['started', 'submitted', 'expired'],
      default: 'started'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
