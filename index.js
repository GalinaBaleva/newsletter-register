import 'dotenv/config' //Don't forget.this must be import
import { writeFileSync, } from 'node:fs'
import dns from 'node:dns/promises'
import nodemailer from 'nodemailer'
import { createServer } from 'node:http'
import serveStatic from 'serve-static'
import finalhandler from 'finalhandler'
import { readFile } from 'node:fs/promises'
import { json } from 'node:stream/consumers'

const PORT = 7001

const { SENDER_EMAIL, APP_PASSWORD } = process.env

const serveFile = serveStatic('public/', { index: ['index.html', 'index.htm'] })

function checkRegex(email) {
    // https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
    // https://www.regular-expressions.info/email.html
    // https://regex101.com/
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    const ok = regex.test(email)
    return ok
}

async function checkMX() {
    const mxRecords = await dns.resolveMx("gmx.at")
    console.log(mxRecords)
}

async function sendEmail() {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: SENDER_EMAIL, pass: APP_PASSWORD },
    })

    const mailOptions = {
        from: SENDER_EMAIL,
        to: 'heer.raab@gmx.at',
        subject: 'Sending Email using Node.js',
        text: 'That was easy! Also using environment variables.',
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(info)
        return info
    }
    catch (err) {
        console.error(err)
    }
}

function appendToFile() {
    const newline = ['Max Mustermann', 'max@gmx.at'].join(',') + '\n'
    writeFileSync('emails.csv', newline, { flag: 'as' })
}


const server = createServer(async (req, res) => {

    if (req.method === 'GET' && req.url === '/newsletter-anmeldung') {
        try {
            const register = await readFile('public/newsletter-anmeldung.html')
            res.writeHead(200, {
                'content-type': 'text/html',
                'location': '/newsletter-anmeldung'
            })
            res.write(register);
            res.end()

        } catch (error) {
            return JSON.stringify({ "error": 'Fehler bei der Anmeldung!' });
        }

    } else if(req.method === 'POST' && req.url === '/newsletter-anmeldung'){
            
        try {
            const {email, dataCheckbox} = await json(req)
            if(!email, !dataCheckbox){
                res.writeHead(400, {'content-type': 'application/json'})
                res.write(JSON.stringify({error: 'Bitte E-Mail und Zustimmung zur Datenschutzrichtlinie angeben.'}))
                res.end()
            }

            if(!checkRegex(email)){
                res.writeHead(400, { 'content-type': 'application/json'})
                res.write(JSON.stringify({error: 'Ungültige E-Mail-Adresse!'}))
                res.end()
            }

            checkRegex(email)
            
        } catch (error) {

        }

        

    } else {
        serveFile(req, res, finalhandler(req, res))
    }

})

server.listen(PORT, () => {
    console.log(`Server is listening on port: http://localhost:${server.address().port}`)
})
