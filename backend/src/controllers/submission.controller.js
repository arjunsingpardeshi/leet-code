const getAllSubmission = async (req, res) => {
    try {
        const userId = req.user.id;
        const submissions = await db.Submission.findMany({
            where: {
                userId: userId
            }
        })
        res.status(200).json({
            success: true,
            message: "submission fetch successfully",
            submissions
        })
    } catch (error) {
        console.error("Fetch Submission Error", error);
        res.status(500).json({error: "failed to fetch submission"})
    }
}

const getSubmissionForProblem = async (req, res) => {

    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const submissions = await db.Submission.findMany({
            
            where: {
                userId: userId,
                problemId: problemId
            }
        })
        res.status(200).json({
            success: true,
            message: "submission fetch successfully",
            submissions
        })
    } catch (error) {
        console.error("Fetch Submission Error", error);
        res.status(500).json({error: "failed to fetch submission"})
    }
}

const getAllTheSubmissionForProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const submissions = await db.Submission.count({
            where: {
                problemId: problemId
            }
        })
        res.status(200).json({
            success: true,
            message: "submission fetch successfully",
            count: submissions
        })
    } catch (error) {
        console.error("Fetch Submission Error", error);
        res.status(500).json({error: "failed to fetch submission"})
    }
}

export {getAllSubmission, getSubmissionForProblem, getAllTheSubmissionForProblem}