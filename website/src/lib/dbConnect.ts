import mongoose from "mongoose";



type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {                               //here void meaning is different from other languages. here it means i dont care about the return value
    if(connection.isConnected){
        console.log("Already connected to database")
        return
    }

    try{
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})

        //console this db to show information and methods like we use below
        console.log(db)
        console.log(db.connections)
        
        connection.isConnected = db.connections[0].readyState

        console.log("db connected succefully")
    }
    catch(error){
        console.log("Databse connection failed", error)
        process.exit()                              //hare we exiting process gracefully because we dont want to run the server if database is not connected
    }
}

export default dbConnect