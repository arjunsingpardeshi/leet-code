import axios from "axios"
const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63
    }
    return languageMap[language.toUpperCase()]
}

const submitBatch = async (submissions) => {
    const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
        submissions
    }); 
    console.log("submission result", data)
    return data                             //[{token},{token},{token}]
}

const pollBatchResults = async (tokens) => {
    console.log("hello")
    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            params:{
                tokens:tokens.join(","),
                base64_encoded:false
            }
        });
            console.log("hello in while")
            console.log("data.submission = ", data.submissions)

        const result = data.submissions;
        const isAllDone = result.every((r) => r.status.id ===3);
        console.log("is all done",isAllDone)
        if(isAllDone) return result;
        await sleep(1000)
    }
}

const sleep = (ms) => new Promise((resolve)  =>  setTimeout(resolve, ms));

function getLanguageName(languageId){

    const LANGUAGE_NAMES = {
        74: "TypeScript",
        63: "JavaScript",
        71: "Python",
        62: "Java"
    };
    
    return LANGUAGE_NAMES[languageId] || "Unknown" ;




}
export {getJudge0LanguageId, submitBatch, pollBatchResults,getLanguageName}