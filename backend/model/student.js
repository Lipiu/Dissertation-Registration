import { Sequelize } from 'sequelize';
import db from '../config/database.js';

const student = db.define('Student', {
    studentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    assignedProfessorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
});

export default student;

export async function checkIfStudentHasProfessor(studentId){
    try {
        const student = await student.findByPk(studentId);
        if (!student) {
            throw new Error('Student not found');
        }
        return student.assignedProfessorId !== null;
    }
    catch (e) {
        throw new Error('Student not found: ' + e.message);
    }
}