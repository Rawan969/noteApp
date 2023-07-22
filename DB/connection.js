import mongoose from 'mongoose'
const connectDB =async ()=>{
    await mongoose.connect(process.env.DBURI).then(res=>{
        console.log('connectDB')
    }).catch(err=>{
        console.log(err)
    })
}

export default connectDB;