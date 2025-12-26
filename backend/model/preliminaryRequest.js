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
        type: Sequelize.STRING,
        allowNull: false,
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
	const request = await getPreliminaryRequestById(id);

	if (request.status !== 'pending') {
		throw new Error('Cannot accept a non-pending preliminary request');
	}

	const user = await getUserById(student, request.studentId);
	const session = await getRegistrationSessionById(request.sessionId);

	// student already accepted elsewhere
	if (user.assignedProfessorId) {
		throw new Error('Student already has an assigned professor');
	}

	// check available slots
	const hasSlots = await verifyAvailableSlots(session.sessionId);
	if (!hasSlots) {
		throw new Error('No available slots in this session');
	}

	// update session
	session.currentNumberOfStudents += 1;
	await session.save();

	// update request
	request.status = 'accepted';
	await request.save();

	// assign professor
	user.assignedProfessorId = session.professorId;
	await user.save();

	return request;
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
