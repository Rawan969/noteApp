import bcrypt from 'bcryptjs';
import userModel from '../../../DB/models/user.model.js'
import { signinSchema, signupSchema } from '../auth.validation.js';
import jwt from 'jsonwebtoken';
export const signup = async (req,res)=>{
    const {name , password, confirmPass , email} = req.body;
    const validator = signupSchema.validate({name , password, confirmPass , email},{abortEarly:false});
    let {value,error} = validator; //there I will catch the error and the value which returns
    let isValid = error == null;
    if(!isValid){
        return res.json({message:"validation error",error})
    }else{
        let user = await userModel.findOne({email});
        if(user){
            return res.json({message:"email exist"})
        }
        let hashPass = await bcrypt.hash(password,parseInt(process.env.SALT));
        let newUser = await userModel.create({name , password:hashPass , email});
        return res.json({message:"success"});
    } 
}

export const signin = async(req,res)=>{
    const {email , password} = req.body;
    let validator = signinSchema.validate(req.body,{abortEarly:false});
    let {value,error} = validator; 
    let isValid = error == null;
    if(!isValid){
        return res.json({message:"validation error",error})
    }
    const user = await userModel.findOne({email});
    if(!user){
        return res.json({message:"invalid account"});
    }else{
        const isMatch = bcrypt.compareSync(password, user.password);//password from body and user.password from DB
        if(!isMatch){
            return res.json({message:"invalid password or email"});
        }else{
            const token = jwt.sign({id:user._id},process.env.SECRET,{expiresIn:'7d'})
            return res.json({message:"success",token});
        }
    }
}