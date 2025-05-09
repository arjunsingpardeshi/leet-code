import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

const createProblem = async (req, res) => {

//going to get all the data from request body
const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions} = req.body;

//going to check user role once again
if(req.user.role!== "ADMIN"){
    return res.status(403).json({error: "you are not allowed to create problem"})
}

//loop through each reference solution for different language
 try {
    
    for(const [language, solutionCode] of Object.entries(referenceSolutions)){
        const languageId = getJudge0LanguageId(language)
        if(!languageId){
            return res.status(400).json({error: `language ${language} is not supported`})
        }

        const submissions = testcases.map(({input, output}) =>({
            source_code:solutionCode,
            language_id:languageId,
            stdin:input,
            expected_output:output
        }));

        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map((res) => res.token);
        console.log("tokens", tokens);
        const results = await pollBatchResults(tokens);

        for(let i=0; i<results.length;i++){

            const result = results[i];
            console.log("result in for loop = ", result);

            if(result.status.id !== 3){
                return res.status(400).json({error:`testcase ${i+1} failed for language ${language}`})
            }
        }
    }
        //save the problem to databse
        const newProblem = await db.Problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId: req.user.id
            }
        });
        return res.status(201).json({
            success: true,
            message: "Problem created succesfully",
            problem: newProblem
        });
    
 } catch (error) {
    console.log(error);
    return res.status(500).json({
        error: "error while creating problem"
    });
 }
}

const getAllProblem = async (req, res) => {
    
    try {
        const problems = await db.Problem.findMany()
        if(!problems){
            return res.status(404).json({
                error: "no problem found"
            })
        }
        res.status(200).json({
            success: true,
            message: "All problem fetch succesfully ",
            problems
        })
    } catch (error) {
        console.log(error);
    return res.status(500).json({
        error: "error while fetching all problem"
    });
    }
}

const getProblemById = async (req, res) =>{

    const {id} = req.params;
    try {
        const problem = await db.Problem.findUnique({
            where: {
                id
            }
        })
        if(!problem){
            return res.status(404).json({error: "problem not found"})
        }
        return res.status(201).json({
            success: true,
            message: "problem fetch successfully",
            problem
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "error while fetching  problem by id"
        });
    }
}
const updateProblem = async (req, res) => {
 //get problem id
//verify problem by id exist or not
//then same step create problem
    const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions} = req.body;
    const problemId = params.id;

    if(req.user.role !== "ADMIN"){
        return res.status(403).json({error: "you are not allowed to update problem"})
    }
    const problem = await db.Problem.findUnique({where: {id: problemId}});
    if(!problem){
        return res.status(404).json({error: "problem not found"})
    }

   try {
     for(const [language,solutionCode] of Object.entries(referenceSolutions)){
 
         const languageId = getJudge0LanguageId(language);
         if(!languageId){
             return res.status(400).json({error:`language ${language} is not supported`});
         }
 
         const submissions = testcases.map(({input, outout}) => ({
             source_code: solutionCode,
             language_id: languageId,
             stdin: input,
             expected_output: outout
         }));
 
         const submissionResults = await submitBatch(submissions);
         const tokens = submissionResults.map(res => res.token);
 
         console.log(tokens);
         const results = await pollBatchResults(tokens)
         
         for(let i = 0; i< results.length; i++){
             const result = results[i];
 
             if(result.status.id !==3){
                 return res.status(400).json({error: `test case ${i+1} failed for language ${language}`});
             }
         }
     }
         const updateProblem = await db.Problem.update({
             where:{id: problemId},
             data:{
                 title,
                 description,
                 difficulty,
                 tags,
                 examples,
                 constraints,
                 testcases,
                 codeSnippets,
                 referenceSolutions,
                 userId: req.user.id
             }
         });
         return res.status(201).json({
             success: true,
             message: "problem update successfully",
             updateProblem
         })
   } catch (error) {
        console.log(error);
        return res.status(500).json({
        error: "error while updating problem"
        });
   }
    
}
const deleteProblem = async (req, res) => {
    
    const {id} = req.params;
    try {
        const problem = await db.problem.findUnique({where: {id}});
        if(!problem){
            return res.status(404).json({error: "problem not found"});
        }
        await db.problem.delete({where: {id}});
        res.status(200).json({
            success: true,
            message: "problem deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "error while deleting  problem by id"
        });
    }
}
const  getAllProblemsSolvedByUser = async  (req, res) => {

    try {
        const problems = db.Problem.findMany({
            where:{
                solvedBy:{
                    some:{
                        userId: req.user.id
                    }
                }
            },
            include:{
                solvedBy:{
                    where:{
                        userId: req.user.id
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: "problem fetch successfully",
            problems
        })
    } catch (error) {
        console.error("error fetching", error);
        res.status(500).json({error: "error while fetching  problems"})
    }
}

export {createProblem, getAllProblem, getProblemById, updateProblem, deleteProblem, getAllProblemsSolvedByUser}