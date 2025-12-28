import multer from 'multer';
import path from 'path';

const studentStorage = multer.diskStorage({
    destionation: function(req, file, cb){
        cb(null, './uploads/students');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    },
});

const professorStorage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/professors');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    },
});

const uploadStudents = multer({storage:studentStorage});
const uploadProfessors = multer({storage:professorStorage});

export { uploadStudents, uploadProfessors };
