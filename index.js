import 'dotenv/config' //Don't forget.this must be import
import { writeFileSync, } from 'node:fs'
import dns from 'node:dns/promises'
import nodemailer from 'nodemailer'
import { createServer } from 'node:http'
import serveStatic from 'serve-static'
import finalhandler from 'finalhandler'
import { readFile } from 'node:fs/promises'

const PORT = 7001

const { SENDER_EMAIL, APP_PASSWORD } = process.env

const serveFile = serveStatic('public/', { index: ['index.html', 'index.htm'] })

const server = createServer(async (req, res) => {
    if(req.url === '/newsletter-anmeldung'){
        const register = await readFile('public/newsletter-anmeldung.html')
        res.writeHead(200, {
            'content-type': 'text/html'
        })
        res.write(register);
        res.end()
    } else {
        serveFile(req, res, finalhandler(req, res))
    }

})

server.listen(PORT, () => {
    console.log(`Server is listening on port: http://localhost:${server.address().port}`)
})




// function checkRegex() {
//     // https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
//     // https://www.regular-expressions.info/email.html
//     // https://regex101.com/
//     const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
//     const ok = regex.test('max-mustermann@gmx.at')
//     console.log('Regex matches?', ok)
// }

// async function checkMX() {
//     const mxRecords = await dns.resolveMx("gmx.at")
//     console.log(mxRecords)
// }

// async function sendEmail() {

//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true,
//         auth: { user: SENDER_EMAIL, pass: APP_PASSWORD },
//     })

//     const mailOptions = {
//         from: SENDER_EMAIL,
//         to: 'heer.raab@gmx.at',
//         subject: 'Sending Email using Node.js',
//         text: 'That was easy! Also using environment variables.',
//     }

//     try {
//         const info = await transporter.sendMail(mailOptions)
//         console.log(info)
//         return info
//     }
//     catch (err) {
//         console.error(err)
//     }
// }

// function appendToFile() {
//     const newline = ['Max Mustermann', 'max@gmx.at'].join(',') + '\n'
//     writeFileSync('emails.csv', newline, { flag: 'as' })
// }

// checkRegex()

// checkMX()

// sendEmail()

// appendToFile()
