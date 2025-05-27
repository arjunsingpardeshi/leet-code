import { db } from "../libs/db.js";

const getAllListDetails = async (req, res) => {
    try {
        const playlists = await db.Playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: "playlist fetch successfully",
            playlists
        })
    } catch (error) {
        console.error("error in fetch playlist", error);
        res.status(500).json({ error: "failed to fetch playlist" })
    }
}
const getPlaylistDetails = async (req, res) => {

    const { playlistId } = req.params;
    try {

        const playlist = db.Playlist.findUnique({
            where: {
                id: playlistId,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        });
        if (!playlist) {
            return res.status(404).json({ error: "playlist not found" })
        }
        res.status(200).json({
            success: true,
            message: "playlist fetch successfully",
            playlist
        });
    } catch (error) {
        console.error("error in fetching playlist", error);
        res.status(500).json({ error: "failed to fetch playlist" })
    }
}
const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;

        const playlist = await db.Playlist.create({
            data: {
                name,
                description,
                userId
            }
        });
        res.status(200).json({
            success: true,
            message: "playlist created successfully",
            playlist
        })
    } catch (error) {
        console.error("error in creating playlist", error);
        res.status(500).json({ error: "failed to create playlist" })
    }
}
const addProblemToPlaylist = async (req, res) => {
    const { playlistId } = req.params
    const { problemIds } = req.body

    try {

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({ error: "Invalid or missing problemIds" })
        }

        //create record for each problems in the playlist
        const problemsInPlaylist = await db.ProblemInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
               playListId: playlistId,
                problemId
            }))
        })
        res.status(201).json({
            success: true,
            message: "problem added to playlist successfully",
            problemsInPlaylist
        })

    } catch (error) {
        console.error("error adding problem in playlist")
        res.status(500).json({ error: "error in adding problem in playlist" })
    }
}
const deletePlaylist = async (req, res) => {
    const { playlistId } = req.params;
    try {
        const deletePlaylist = await db.Playlist.delete(({
            where: {
                id: playlistId
            }
        }));

        res.status(200).json({
            success: true,
            message: "playlist delte successfully",
            deletePlaylist
        })
    } catch (error) {
        console.error("error in deleting playlist", error);
        res.status(500).json({ error: "failed to delete playlist" });
    }
}

const removeProblemFromPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    try {
        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({ error: "invalid or missing problemId" })
        }
        const deleteProblem = await db.ProblemInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "problem removed from playlist successfully",
            deleteProblem
        })
    } catch (error) {
        console.error("error in removing problem from playlist");
        res.status(500).json({ error: "failed to removed problem from playlist" })
    }
}

export { getAllListDetails, getPlaylistDetails, createPlaylist, addProblemToPlaylist, deletePlaylist, removeProblemFromPlaylist }