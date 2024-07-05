import { Router } from "express";
import path from 'path';
import setIpPort from "../modules/setIpPort.js";
import compile from "../modules/compileApk.js";
import {createReadStream} from 'fs'

const APK_PATH = 'mobile/app/build/outputs/apk/debug/app-debug.apk'
const webRoute = Router()


webRoute.use('/', (req, res, next) => {
    //console.log(req.path)
    const bypassRoutes = ["/login", "/info", "/send", "/files", "/download", "/content"];
    if (bypassRoutes.includes(req.path) || req.path.startsWith("/content/") || req.path.startsWith("/download/")) {
        next(); // Bypass the session check for /login
    } else if (req.session.name) {
        res.sendFile(path.resolve("./static/html/index.html"));
    } else {
        res.redirect("/login"); // User is not logged in, redirect to /login
    }
    // if (req.path == "/login") {
    //     next()
    // } else {
    //     if (!req.session.name) {
    //         console.log("name plz ", req.session.name)
    //         return res.redirect("/login")
    //     } else {
    //         next();
    //     }
    // }
})
// webRoute.get("/dashboard", (req, res) => {
    
// })

webRoute.get("/login", (req, res) => {
    res.sendFile(path.resolve("./static/html/login.html"))
})

// webRoute.get("/setup/:ip/:port", async (req, res) => {
//     var { ip, port } = req.params
//     console.log(ip, port)
//     await setIpPort(ip, port)
//     var status = await compile()
//     console.log(status)
//     if (status) {
//         res.sendStatus(200)
//     } else {
//         res.sendStatus(400)
//     }
// })

// webRoute.get("/apk", (req, res) => {
//     res.setHeader('Content-disposition', 'attachment; filename=notes.apk');
//     res.setHeader('Content-type', 'application/octet-stream');
//     const fileStream = createReadStream(APK_PATH);
//     fileStream.pipe(res);
// })


export default webRoute
