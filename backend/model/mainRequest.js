import { Sequelize } from 'sequelize';
import db from '../config/database.js';
import user, { getUserById } from './user.js';
import professor from './professor.js';
import student from './student.js';

const mainRequest = db.define('MainRequest', {
    mainRequestId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentFilePath: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    professorFilePath: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
    studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    professorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});

export default mainRequest;

export async function getMainRequestById(id){
    let request = await mainRequest.findByPk(id);
    if(!request){
        throw new Error('MainRequest not found');
    }
    return request;
}

export async function getMainRequestByStudentId(id){
    let request = await mainRequest.findOne({
        where: { 
            studentId: id, 
        },
    });
    if(!request){
        throw new Error('MainRequest not found for the given studentId');
    }
    return request;
}

export async function getMainRequestByProfessorId(id){
    let request = await mainRequest.findOne({
        where: {
            professorId: id,
        },
    });
    if(!request){
        throw new Error('MainRequest not found for the given professorId');
    }
    return request;
}

export async function acceptMainRequest(id){
    try{
        let request = await getMainRequestById(id);
        request.status = 'approved';
        return await request.save();
    }
    catch(e){
        throw e;
    }
}

export async function rejectMainRequest(id){
    try{
        let request = await getMainRequestById(id);
        request.status = 'rejected';
        return await request.save();
    }
    catch(e){
        throw e;
    }
}

export async function updateMainRequestProfessorFilePath({professorFilePath, id}){
    try{
        let request = await mainRequest.findByPk(id);
        if(!request){
            throw new Error('MainRequest not found');
        }
        request.professorFilePath = professorFilePath;
        await request.save();
        return request;
    }
    catch(e){
        throw e;
    }
}

export async function updateMainRequestStudentFilePath({studentFilePath, id}){
    try {
        let request = await mainRequest.findByPk(id);
        if(!request){
            throw new Error('MainRequest not found');
        }
        request.studentFilePath = studentFilePath;
        await request.save();

        return request;
    }
    catch(e){
        throw e;
    }
}

export async function createMainRequest(request){
    const { studentFilePath, studentId, professorId } = request;

    let status = 'pending';

    try {
        await getUserById(student, studentId);
        await getUserById(professor, professorId);
    }
    catch(e){
        throw new Error(e.message);
    }

    //check duplicate sessions
    let duplicateSession = await mainRequest.request({
        where: {
            studentId: studentId,
            professorId: professorId,
        },
    });
    if(duplicateSession){
        throw new Error('A session for this user already exists!');
    }
    return await mainRequest.create({ studentFilePath, studentId, professorId, status });
}