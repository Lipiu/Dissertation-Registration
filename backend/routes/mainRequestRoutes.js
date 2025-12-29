import express from 'express';
import { uploadProfessors, uploadStudents } from '../config/multer.js';
import { verifyProfessor, verifyStudent, verifyToken } from '../middleware/middleware.js';
import { 
    acceptMainRequest, createMainRequest, getMainRequestById, 
    getMainRequestByStudentId, getMainRequestByProfessorId, 
    rejectMainRequest, updateMainRequestProfessorFilePath, 
    updateMainRequestStudentFilePath 
} from '../model/mainRequest.js';


const mainRequestRoutes = express.Router();

/*
Status for mainRequest:
    - pending
    - accepted
    - rejected
*/

//create main request for student
mainRequestRoutes.post(
    '/mainrequest',
    verifyStudent,
    uploadStudents.single('file'),
    async(req, res) => {
        if(!req.file){
            return res.status(400).json({
                message: 'File required'
            });
        }

        const studentId = req.user.userId;
        const { professorId } = req.body;
        const studentFilePath = req.file.path;

        if(!professorId){
            return res.status(400).json({
                message: 'Professor ID required'
            });
        }

        try{
            const request = await createMainRequest({
                studentId,
                professorId,
                studentFilePath
            });
            res.status(201).json(request);
        }
        catch(e){
            console.error(e.stack);
            res.status(500).json(e.message);
        }
    }
);

//accept or reject professor
mainRequestRoutes.put(
    '/mainrequest/:id/accept',
    verifyProfessor,
    async(req, res) => {
        try{
            const request = await acceptMainRequest(req.params.id);
            res.json(request);
        }
        catch(e){
            console.error(e.stack);
            res.status(500).json(e.message);
        }
    }
);

mainRequestRoutes.put(
    '/mainrequest/:id/reject',
    verifyProfessor,
    async(req, res) => {
        try{
            const request = await rejectMainRequest(req.params.id);
            res.json(request);
        }
        catch(e){
            console.error(e.stack);
            res.status(500).json(e.message);
        }
    }
);

//get requests

//get mainRequest by id (student or professor)

mainRequestRoutes.get(
    '/mainrequest/:id',
    verifyToken,
    async(req, res) =>{
        try{
            const request = await getMainRequestById(req.params.id);
            res.json(request);
        }
        catch(e){
            res.status(500).json(e.message);
        }
    }
);

//get student own request
mainRequestRoutes.get(
    '/mainrequest/student',
    verifyStudent,
    async(req, res) => {
        try{
            const request = await getMainRequestByStudentId(req.user.userId);
            res.json(request);
        }
        catch(e){
            console.error(e.message);
            res.status(500).json(e.message);
        }
    }
);

//get all requests for professor
mainRequestRoutes.get(
  '/mainrequest/professor',
  verifyProfessor,
  async (req, res) => {
    try {
      const requests = await getMainRequestByProfessorId(req.user.userId);
      res.json(requests);
    } catch (e) {
      console.error(e.stack);
      res.status(500).json(e.message);
    }
  }
);

//file uploads
mainRequestRoutes.put(
    '/mainrequest/:id/uploadStudentFile',
    verifyStudent,
    uploadStudents.single('file'),
    async(req, res) => {
        if(!req.file){
            return res.status(400).json({
                message: 'File required'
            });
        }
        try{
            const request = await updateMainRequestStudentFilePath({
                id: req.params.id,
                studentFilePath: req.file.path
            });
            res.json(request);
        }
        catch(e){
            console.error(e.stack);
            res.status(500).json(e.message);
        }
    }
);

mainRequestRoutes.put(
    '/mainrequest/:id/uploadProfessorFile',
    verifyProfessor,
    uploadProfessors.single('file'),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ 
                message: 'File required' 
            });
        }

        try {
            const request = await updateMainRequestProfessorFilePath({
                id: req.params.id,
                professorFilePath: req.file.path
            });
            res.json(request);
        } 
        catch (e) {
            console.error(e.stack);
            res.status(500).json(e.message);
        }
    }
);

//download
mainRequestRoutes.get(
    '/mainrequest/:id/downloadStudentFile',
    verifyToken,
    async(req, res) => {
        const request = await getMainRequestById(req.params.id);
        res.download(request.studentFilePath); 
    }
);

mainRequestRoutes.get(
    '/mainrequest/:id/downloadProfessorFile',
    verifyToken,
    async(req, res) =>{
        const request = await getMainRequestById(req.params.id);
        res.download(request.professorFilePath);
    }
);

export default mainRequestRoutes;