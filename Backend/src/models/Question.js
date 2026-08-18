const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, { _id: false }); // Disable _id for simple subdocuments if desired, or keep it. Let's keep it disabled for cleaner array elements.

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    constraints: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    starterCode: {
      type: Map,
      of: String,
      default: {}
    },
    testCases: [TestCaseSchema],
    scoreWeight: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
