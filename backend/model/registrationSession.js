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
    finishTime: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    currentNumberOfStudents: {
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

