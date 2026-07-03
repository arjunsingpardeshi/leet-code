import axios from "axios"

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = "judge0-ce.p.rapidapi.com";
const RAPID_API_BASE_URL = `https://${RAPID_API_HOST}`;

const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63
    }                   
    return languageMap[language.toUpperCase()]
}

const submitBatch = async (submissions) => {
try {
    const { data } = await axios.post(
      `${RAPID_API_BASE_URL}/submissions/batch`,
      { submissions },
      {
        params: { 
          base64_encoded: "false",
          fields: "*"
         },
        headers: {
          "x-rapidapi-key": RAPID_API_KEY,
          "x-rapidapi-host": RAPID_API_HOST,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("submission result:", data);
    return data; // Return [{ token }, { token }, ...]
  } catch (error) {
    console.error("Batch submission error:", error.response?.data || error.message);
    throw error;
  }
}

const pollBatchResults = async (tokens) => {
    console.log("hello")
    while(true){
        const { data } = await axios.get(`${RAPID_API_BASE_URL}/submissions/batch`, {
        params: {
          tokens: tokens.join(","), // comma-separated tokens
          base64_encoded: "false",  // keep false if your source wasn't encoded
          fields: "*",              // optional: get all fields
        },
        headers: {
          "x-rapidapi-key": RAPID_API_KEY,
          "x-rapidapi-host": RAPID_API_HOST,
        },
      });
            console.log("hello in while")
            console.log("data.submission = ", data.submissions)

        const result = data.submissions;
        const isAllDone = result.every((r) => r.status.id ===3);
        console.log("is all done",isAllDone)
        if(isAllDone) return result;
        await sleep(1500)
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