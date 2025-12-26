import { Sequelize } from 'sequelize';
import db from '../config/database.js';
import { getRegistrationSessionById, getRegistrationSessionByProfessorId, verifyAvailableSlots } from './registrationSession.js';
import student from './student.js';
import { getUserById } from './user.js';

const preliminaryRequest = db.define('PreliminaryRequest', {
    preliminaryRequestId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    sessionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
    },
	justification: {
		type: Sequelize.STRING,
		allowNull: true, // pending and accepted requests do not need justification
	},
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

export default preliminaryRequest;

export async function rejectPreliminaryRequest(id, justification) {
	const request = await getPreliminaryRequestById(id);

	if (request.status !== 'pending') {
		throw new Error('Cannot reject a non-pending preliminary request');
	}

	request.status = 'rejected';
	request.justification = justification;

	return request.save();
}

export async function acceptPreliminaryRequest(id) {
	const transaction = await db.transaction();

	try {
		const request = await getPreliminaryRequestById(id, { transaction });

		if (request.status !== 'pending') {
			throw new Error('Cannot accept a non-pending request');
		}

		const studentUser = await getUserById(student, request.studentId, { transaction });
		const registrationSession = await getRegistrationSessionById(request.sessionId, { transaction });

		if (studentUser.assignedProfessorId) {
			throw new Error('Student already has an assigned professor.');
		}

		await verifyAvailableSlots(registrationSession.sessionId);

		registrationSession.currentNumberOfStudents += 1;
		await registrationSession.save({ transaction });

		request.status = 'approved';
		await request.save({ transaction });

		studentUser.assignedProfessorId = registrationSession.professorId;
		await studentUser.save({ transaction });

		await transaction.commit();
		return request;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}


export async function getPreliminaryRequestsBySessionId(id) {
	return preliminaryRequest.findAll({
		where: { sessionId: id },
		include: [{ model: student }],
	});
}

export async function getPreliminaryRequestsByStudentId(id) {
	return preliminaryRequest.findAll({
		where: { studentId: id },
	});
}

export async function getPreRequestsFromRegistrationSessionByProfessorId(professorId) {
	const session = await getRegistrationSessionByProfessorId(professorId);
	return getPreliminaryRequestsBySessionId(session.sessionId);
}

export async function getPreliminaryRequestById(id) {
	const request = await preliminaryRequest.findByPk(id);
	if (!request) {
		throw new Error('Preliminary request not found');
	}
	return request;
}

export async function createPreRequest({ studentId, sessionId, title }) {
	const session = await getRegistrationSessionById(sessionId);
	const user = await getUserById(student, studentId);

	const hasSlots = await verifyAvailableSlots(session.sessionId);
	if (!hasSlots) {
		throw new Error('Registration session is full');
	}

	if (user.assignedProfessorId) {
		throw new Error('Student already has an assigned professor');
	}

	const duplicate = await preliminaryRequest.findOne({
		where: { studentId, sessionId },
	});
	if (duplicate) {
		throw new Error('Student already sent a request to this session');
	}

	return preliminaryRequest.create({
		studentId,
		sessionId,
		title,
		status: 'pending',
	});
}
