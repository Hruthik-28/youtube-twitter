import dotenv from 'dotenv'
import connectToDB from './db/dbConnect.js'
import app from './app.js'

dotenv.config({
    path: '/env'  // if giving prob try "./.env"
})

connectToDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is listening on: ${process.env.PORT}`);
    })
})
.catch((error) => console.log("MONGODB connection failed!!!: ", error))
















/**import express from 'express'
const app = express()

( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error", error);
        throw error
    }
})()
**/