


import { create } from "zustand";
import toast from "react-hot-toast";



import {axiosInstance} from "../lib/axios"

export const useProblemStore  = create((set) => ({
   
    problems: [],
    problem: null,
    solvedProblems: [],
    isProblemsLoading: false,
    isProblemLoading: false,


    getAllProblems: async () => {
        try {
            set({isProblemsLoading: true});

            const res = await axiosInstance.get("/problems/get-all-problem");
            set({problems: res.data.problems});

        } catch (error) {
            console.log("Error getting all problems", error);
            toast.error("Error in getting problems")
        }
        finally{
            set({isProblemsLoading: false});

        }
    },

    getProblemById: async (id) => {

        try {
            set({isProblemLoading: true});
           // console.log("problem id = ", id)
            const res = await axiosInstance.get(`/problems/get-problem/${id}`);

            set({problem: res.data.problem})
            
            toast.success(res.data.message);
        } catch (error) {
            console.log("Error getting  problem by id", error);
            toast.error("Error in geting problemby id")
        }
        finally{
            set({isProblemLoading: false})
        }
    },

    getSolvedProblemByUser: async () => {

        try {
            const res = await axiosInstance.get("/problems/get-solved-problems");
            
            set({solvedProblems: res.data.problems})
        } catch (error) {
            console.log("Error getting  solved problems", error);
            toast.error("EError getting  solved problems")
        }
    }
}))