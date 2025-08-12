import * as dotenv from"dotenv"
import path from "node:path"
// dotenv.config({path:path.join("./src/config/.env.dev")})
const envPath = path.join(process.cwd(), "src", "config", ".env.dev");

dotenv.config({ path: envPath });
 
import express from'express'
import userController from "./modules/users/user.controller.js"  
import authController from "./modules/auth/auth.controller.js"         
import messageController from "./modules/message/message.controller.js"         
import cors from 'cors'
import ConnectionDB from './DB/connection.db.js'
import { globalErrorHandler } from './utils/response.js'
import morgan from "morgan"
import helmet from "helmet"
import { rateLimit } from 'express-rate-limit'

export default async function bootstrap() {
    const app = express()
    const port = process.env.PORT||5000


// rate Limit
const limiter = rateLimit({
	windowMs: Number(process.env.WINDOW_TIME_LIMIT) * 60 * 1000, // 15 minutes
	limit: Number(process.env.LIMIT), // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	// legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message : {error:"Too many requests, please try again later."}
	// ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// // store: ... , // Redis, Memcached, etc. See below.
})

app.use(limiter)
    // ====== cors
    // var whitelist = process.env.ORIGINS.split(",") || []
    // var corsOptions = {
    //   origin: function (origin, callback) {
    //     if (whitelist.indexOf(origin) !== -1) {
    //       callback(null, true)
    //     } else {
    //       callback(new Error('Not allowed by CORS'))
    //     }
    //   }
    // }
    // app.use ( cors(corsOptions))
    app.use (cors())
    
    // convert buffer data
    
app.use(helmet());
    app.use ( morgan("common"))
    app.use(express.json())
// DB Connection
    await ConnectionDB()
    app.use("/uploads" ,express.static(path.resolve("./src/uploads")))
// app-routing
    app.get('/', (req, res) => res.send('Hello World!'))

    app.use("/users",userController)

    app.use("/message",messageController)

    app.use("/auth",authController)
    app.get("{/*dummy}",(req, res) => res.status(404).json('In-valid app router'))
// global error handler
    app.use(globalErrorHandler)

    app.listen(port, () => console.log(`app listening on port ${port}!`))
}