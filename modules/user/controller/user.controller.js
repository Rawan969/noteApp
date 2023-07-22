import userModel from "../../../DB/models/user.model.js"
import {changePassSchema, updateSchema} from "../user.validation.js"
import bcrypt from 'bcryptjs';

/**user info
 * delete
 * update
 */
export const getUser =async (req,res)=>{
   /*console.log(req.id);*/
   let preuser = await userModel.findById(req.id);
   if(!preuser){
      return res.status(404).json({message:"user not found"});
   }
   const user = await userModel.findById(req.id).select(['-_id','name','email']);//will not return id (-)
   return res.status(200).json({message:"users",user});
}

//delete user
export const deleteUser =async (req,res)=>{
   await userModel.findByIdAndDelete(req.id);
   return res.status(200).json({message:"account deleted successful"});
}
//update user 
export const updateUser = async(req,res)=>{
   let { name,email}=req.body;
   let validator = updateSchema.validate(req.body);
   let {value , error}= validator;
   let isValid = error == null ;
   if(!isValid){
      return res.json({message:"validation error",error});
   }
   let user = await userModel.findById(req.id);
   if(!user){
      return res.status(404).json({message:"user not found"});
   }
   let newUser = await userModel.findByIdAndUpdate(req.id,{name,email},{new:true});
   return res.status(200).json({message:"account updated successful",newUser});
}
//change password
export const changePassword = async(req, res) => {
   let {currentPassword,newPassword} = req.body;
   let validator = changePassSchema.validate(req.body);
   let {value , error}= validator;
   let isValid = error == null ;
   if(!isValid){
      return res.json({message:"validation error",error});
   }
   if(currentPassword==newPassword){
      return res.status(401).json({message:"current password is equal to new password"});
   }
   let user = await userModel.findById(req.id);
   if(!user){
      return res.status(404).json({message:"user not found"});
   }else{
      let isMatch = await bcrypt.compare(currentPassword,user.password);
      if(!isMatch){
         return res.status(401).json({message:"invalid current password"});
      }else{
         let newHash = bcrypt.hashSync(newPassword,parseInt(process.env.SALT));
         await userModel.updateOne({_id:user.id},{$set:{password:newHash}});
         return res.status(200).json({message:"password updated"});
      }
   }
}