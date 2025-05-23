import { status } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

const executeCode = async (req, res) => {
    try {
        const {source_code, language_id, stdin, expected_outputs, problemId} = req.body;
        const userId = req.user.id;

        // validate test cases
        if(!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
            return res.status(400).json({error: "Invalid or missing test cases"})            
        }

        //prepare each test case for judge0 batch submission

        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
            base64_encoded: false,
            wait: false
        }));

        //send batch of submission to judge0
        const submitResponse = await submitBatch(submissions);

        const tokens = submitResponse.map((res) => res.token);

        //poll judge0 for results of submitted test cases
        const results = await pollBatchResults(tokens);

        console.log("=========result=========");
        console.log(results);
        
        //analys all test case result
        let allPassed = true;
        const detailedResults = results.map((result,i) => {
            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output

            if(!passed) allPassed = false;

            console.log(`Testcase #${i+1}`);
            console.log(`Input for test case #${stdin[i]}`);
            console.log(`Expected output for testcase #${i+1} : ${expected_output}`);
            console.log(`actual output for test case #${i+1} : ${stdout}`);

            console.log(`matched test case #${i+1} : ${passed}`)

            return {
                testCase: i+1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined
            }

        });
        console.log("detail result = ",detailedResults);
    
        //store submission summary 
        const submission = await db.Submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compile_output) ? JSON.stringify(detailedResults.map((r) => r.compile_output)) : null,
                status: allPassed ? status.ACCEPTED : status.WRONG_ANSWER,
                memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
                time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
            }
        })

        //if all passed = true mark problem as solved for current user
        if(allPassed){
            await db.ProblemSolved.upsert({
                where: {
                    userId_problemId:{
                        userId, problemId
                    }
                },
                update: {},
                create: {
                    userId, problemId
                }
            })
        }

        //save individual test case result using detailresult
        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time
        }))
        await db.testCaseResult.createMany({
            data: testCaseResults
        })
        
        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id
            },
            include: {
                testCases: true
            } 
        })
        res.status(200).json({
            success: true,
            message: "code exected",
            submission: submissionWithTestCase
        })

    } catch (error) {
        console.error("Error executing code", error.message)
        res.status(500).json({error: "failed to execute code"})
    }
}
export {executeCode}