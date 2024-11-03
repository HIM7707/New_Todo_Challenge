const jwt = require('jsonwebtoken');
const JWT_SECRET = 'ANiket@';

const jwtAuth = (req,res,next) =>{
    try{
        const authHeader = req.headers['Authorization'] || req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if(!token){
            return res.status(401).json({
                message: "Token missing or unauthorized"
            })
        }

        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(e){
        console.log("Authorization failed!")
        res.status(403).json({
            message: e
        })
    }
}

module.exports = jwtAuth ; 