import db from './database.js';
import mainRequest from '../model/mainRequest.js';
import professor from '../model/professor.js';
import registrationSession from '../model/registrationSession.js';
import student from '../model/student.js';
import preliminaryRequest from '../model/preliminaryRequest.js';

async function initDatabase(){
    //professor to student - many to one relationship
    professor.hasMany(student, {foreignKey: 'assignedProfessorId'});
    student.belongsTo(professor, {foreignKey: 'assignedProfessorId'});

    //student to mainRequest - one to one relationship
    student.Many(mainRequest, {foreignKey: 'studentId'});
    mainRequest.belongsTo(student, {foreignKey: 'studentId'});

    //professor to mainRequest - many to one relationship
    professor.hasMany(mainRequest, {foreignKey: 'professorId'});
    mainRequest.belongsTo(professor, {foreignKey: 'professorId'});

    professor.hasMany(registrationSession, {foreignKey: 'professorId'});
    registrationSession.belongsTo(professor, {foreignKey: 'professorId'});

    student.hasMany(preliminaryRequest, {foreignKey: 'studentId'});
    preliminaryRequest.belongsTo(student, {foreignKey: 'studentId'});

    registrationSession.hasMany(preliminaryRequest, {foreignKey: 'sessionId'});
    preliminaryRequest.belongsTo(registrationSession, {foreignKey: 'sessionId'});

    //sync
    await db.sync({
        alter: true,
    });
}

export default initDatabase;