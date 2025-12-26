import { Sequelize } from 'sequelize';
import db from '../config/database.js';
import professor from './professor.js';

const registrationSession = db.define('RegistrationSession', {
    sessionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    professorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    startTime: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    endTime: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    currentStudents: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    maxNumberOfStudents: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});

export default registrationSession;

export async function getRegistrationSessionById(id){
    const session = await registrationSession.findByPk(id);
    if(!session){
        throw new Error('Registration session not found!');
    }
    return session;
}



export async function getRegistrationSessionByProfessorId(id){
    const today = new Date();
    const session = await registrationSession.findOne({
        where: {
            professorId : id,
            startTime: {
                [Sequelize.Op.lt]: today,
            },
            endTime: {
                [Sequelize.Op.gt]: today,
            },
        },
    });
    if(!session){
        throw new Error('Professor does not have registration!');
    }

    return session;
}

export async function createRegistrationSession(session){
    const { professorId, startTime, endTime, maxNumberOfStudents } = session;
    const currentStudents = 0;

    const duplicateSession = await registrationSession.findOne({
        where: {
            professorId : professorId,
            startTime : {
                [Sequelize.Op.lt] : new Date(endTime),
            },
            endTime : {
                [Sequelize.Op.gt] : new Date(startTime),
            },
        },
    });
    
    if(duplicateSession){
        throw new Error('A registration session already exists');
    }
    try{
        return await registrationSession.create({ professorId, startTime, endTime, maxNumberOfStudents });
    }
    catch(e){
        throw e;
    }
}

export async function getAllRegSessionsByProfessorId(id){
    const session = await registrationSession.findAll({
        where: {
            professorId: id,
        },
    });

    if(session === 0 ){
        throw new Error('Professor does not have any sessions');
    }
    else{
        return session;
    }
}

export async function verifyAvailableSlots(sessionId){
    let session = await getRegistrationSessionById(sessionId);
    if(session.dataValues.currentStudents >= session.dataValues.maxNumberOfStudents){
        throw new Error('Session is full.');
    }
    return true;
}

export async function getAllActiveRegSessions(){
    const today = new Date();
    const activeSessions = await registrationSession.findAll({
        where: {
            startTime: {
                [Sequelize.Op.lte]: today,
            },
            endTime:{
                [Sequelize.Op.gte]: today,
            },
        },
        include: [{
            model: professor,
            attributes: ['name'],
        }],
    });

    if(activeSessions === 0){
        throw new Error('No active registration sessions found!');
    }
    return activeSessions;
}