const mongoose = require('mongoose');

const TestCaseResultSchema = new mongoose.Schema({
  passed: {
    type: Boolean,
    required: true
  },
  runtime: {
    type: Number, // execution time in milliseconds
    default: 0
  },
  memory: {
    type: Number, // memory usage in kilobytes
    default: 0
  }
}, { _id: false });

const SubmissionSchema = new mongoose.Schema(
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
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    language: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compile_error'],
      default: 'pending'
    },
    testCaseResults: [TestCaseResultSchema],
    score: {
      type: Number,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Submission', SubmissionSchema);
