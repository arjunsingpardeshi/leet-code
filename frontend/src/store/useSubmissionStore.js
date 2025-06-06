import { create } from "zustand";
import toast from "react-hot-toast";

import { axiosInstance } from "../lib/axios";

export const useSubmissionStore =  create((set) => ({

    isLoading: null,
    submissions: [],
    submission: null,
    submissionCount: null,

    getAllSubmissions: async () => {

        try {
            set({isLoading: true})
            const res = await axiosInstance.get("/submission/get-all-submission");
            set({submissions: res.data.submissions})
            toast.success(res.data.message)
        } catch (error) {
            console.log("Error getting all submission", error)
            toast.error("Error getting all submissions")
        }
        set({isLoading: false})
    },

    getSubmissionForProblem: async (problemId) => {

        try {
                const res = await axiosInstance.get(`/submission/get-submission/${problemId}`)
                console.log("submissions for problem is = ",res.data.submissions)
                set({submission: res.data.submissions})
        } catch (error) {
            console.log("Error getting submission for problem", error)
            toast.error("Error getting submission for problem")
        }
    },

    getSubmissionCountForProblem: async (problemId) => {
        try {
            console.log("problem id = ", problemId)

            const res = await axiosInstance.get(`/submission/get-submission-count/${problemId}`)

            set({submissionCount: res.data.count})
        } catch (error) {
            console.log("Errro getting submission count for problem", error)
            toast.error("Error getting submission count for problem")
        }
    }
}))