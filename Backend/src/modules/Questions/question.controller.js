const Questions = require('../../models/Question');

// 1. Create a custom question
exports.createQuestion = async (req, res, next) => {
    try {
        const { title, description, constraints, difficulty, starterCode, testCases, scoreWeight } = req.body;
        if (!title || !description || !difficulty) {
            return res.status(400).json({ message: "Title, description and difficulty are required" });
        }
        const newQuestion = await Questions.create({
            title,
            description,
            constraints,
            difficulty,
            starterCode: starterCode || {},
            testCases: testCases || {},
            scoreWeight: scoreWeight || 10
        });
        return res.status(201).json({
            message: "Question created successfully",
            question: newQuestion
        });
    } catch (err) {
        console.error("Create question error:", err);
        return res.status(500).json({ message: "Server error while creating question." });
    }
};

// 2. Fetch all questions (Question Bank)
exports.getQuestionBank = async(req,res) =>{
    try{
        const questions = await Questions.find({}).select('.testCases');
        return res.status(200).json(questions);

    }catch(err){
         console.error("Get question bank error:", err);
        return res.status(500).json({ message: "Server error while fetching question bank." });
    }
};

// 3. Fetch a single question details (with test cases for editing)
exports.getQuestionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }
        return res.status(200).json(question);
    } catch (err) {
        console.error("Get question details error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

