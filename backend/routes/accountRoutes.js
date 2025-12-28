import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_KEY, MIN_PASS_LENGTH } from '../config/const.js';
import { createUser, getUserByEmailAndCheckPassword } from '../model/user.js';
import professor from '../model/professor.js';
import student from '../model/student.js';

const accountRoutes = express.Router();

function generateToken(user, userModel){
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

async function registerHandler(req, res, userModel){
    const  body = req.body || {};
    let { name, email, password, repeatedPassword } = req.body;

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

    if(password.length < MIN_PASS_LENGTH){
        return res.status(400).json({
            message: 'Password must be at least 8 characters'
        });
    }

    //hashing the password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);


    try{
        const user = await createUser(userModel, {name,email,password});
        return res.status(201).json(user);
    }
    catch(error){
        res.status(500).json(error.message);
    }
}

async function loginHandler(req,res,userModel){
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(401).json({
            message: 'Missing email or password'
        });
    }
    try{
        const user = await getUserByEmailAndCheckPassword(
            userModel,
            email,
            password
        );
        const token = generateToken(user, userModel);
        return res.status(200).json({
            user,
            token
        });
    }
    catch(error){
        return res.status(401).json({
            message: error.message
        });
    }
}

//register
accountRoutes.post('/student/register', (req,res) => 
    registerHandler(req,res,student)
);

accountRoutes.post('/professor/register', (req,res) => 
    registerHandler(req,res,professor)
);

//login
accountRoutes.post('/student/login', (req, res) =>
    loginHandler(req,res,student)
);

accountRoutes.post('/professor/login', (req,res) =>
    loginHandler(req, res, professor)
);

export default accountRoutes;