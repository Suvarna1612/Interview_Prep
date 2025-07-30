const Session = require("../models/Session.js");
const Question = require('../models/Question.js');

// @desc Create a new session and linked questions
// @route POST /api/sessions/create
// @access Private
const createSession = async (req, res) => {
  try {
    const {
      role,
      experience,
      topicsToFocus,
      description,
      questions
    } = req.body;
    const userId = req.user.id;
    const session = await Session.create({
      role,
      experience,
      topicsToFocus,
      description,
      user: userId
    });
    const questionsDocs = await Promise.all(questions.map(async q => {
      const question = await Question.create({
        session: session._id,
        question: q.question,
        answer: q.answer
      });
      return question._id;
    }));
    session.questions = questionsDocs;
    await session.save();
    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc Get all sessions for the logged in user
// @route GET /api/sessions/my-sessions
// @access Private 
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user.id
    }).sort({
      createdAt: -1
    }).populate('questions');
    res.status(200).json({
      success: true,
      message: "Sessions fetched successfully",
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc Get a session by Id with populated questions
// @route GET /api/sessions/:id
// @access Private 
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate({
      path: 'questions',
      options: {
        sort: {
          isPinned: -1,
          createdAt: -1
        }
      }
    }).exec();
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Session fetched successfully",
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc Delete a session and its questions
// @route DELETE /api/sessions/:id
// @access Private 
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    // check if the logged-in user owns this session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorised to delete this session"
      });
    }
    // first, delete all the questions linked to this session
    await Question.deleteMany({
      session: session._id
    });
    // then delete the session
    await session.deleteOne();
    res.status(200).json({
      success: true,
      message: "Session deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  deleteSession
};