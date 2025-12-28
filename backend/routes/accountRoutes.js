import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_KEY, MIN_PASS_LENGTH } from '../config/const.js';
import { createUser, getUserByEmailAndCheckPassword } from '../model/user.js';
import professor from '../model/professor.js';
import student from '../model/student.js';

const accountRoutes = express.Router();

async function generateToken(user, userModel){
    return jwt.sign(
        {
            userId: user.professorId || user.studentId,
            role: userModel.name, // 'Student' or 'Professor'
            email: user.email,
            name: user.name,
        },
        JWT_KEY,
        {
            expiresIn: '24h',
        }
    );
}

async function loginHandler(req, res, userModel){
    const { name, email, password, repeatedPassword } = req.body;

    if(!name || !email || !password || !repeatedPassword){
        return res.status(400).json({
            message: 'Missing fields!'
        });
    }

    if(password !== repeatedPassword){
        return res.status(400).json({
            message: 'Passwords do not match. Please try again!'
        });
    }

    if(password.lenth < MIN_PASS_LENGTH){
        return res.status(400).json({
            message: 'Password must be at least 8 characters'
        });
    }


    try{
        const user = await createUser(
            userModel,
            name,
            email,
            password
        );
        return res.status(201).json(user);
    }
    catch(error){
        res.status(500).json(e.message);
    }
}

//register
accountRoutes.post('/student/register', (req,res) => 
    registerHandler
);

//login
accountRoutes.post('/student/login', (req, res) =>
    loginHandler(req,res,student)
);

accountRoutes.post('/professor/login', (req,res) =>
    loginHandler(req, res, professor)
);

export default accountRoutes;