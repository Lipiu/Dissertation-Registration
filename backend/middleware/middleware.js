import jwt, { decode } from 'jsonwebtoken';
import { JWT_KEY } from '../config/const.js';

export function verifyToken(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
            message: 'Authorization header missing!'
        });
    }

    const [type, token] = authHeader.split(' ');
    if(type !== 'Bearer' || !token){
        return res.status(401).json({
            message: 'Invalid authorization format'
        });
    }

    try{
        const decodedToken = jwt.verify(token, JWT_KEY);
        req.user = decodedToken;
        next();
    }
    catch(error){
        return res.status(401).json({
            messge: 'Invalid token'
        });
    }
}

export function verifyProfessor(req, res, next){
    verifyToken(req,res, ()=>{
        if(req.user.role !== 'Professor'){
            return res.status(401).json({
                message: 'Professor access only!'
            });
        }
        next();
    });
}

export function verifyStudent(req, res, next){
    verifyToken(req,res,()=>{
        if(req.user.role !== 'Student'){
            return res.status(401).json({
                message: 'Student access only!'
            });
        }
        next();
    });
}