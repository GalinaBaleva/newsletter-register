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

async function checkMX(email) {
    const emailDns = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(emailDns)
        return mxRecords.length > 0
    } catch (error) {
        return false
    }
}

async function sendEmail(mail) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: SENDER_EMAIL, pass: APP_PASSWORD },
    })

    const mailOptions = {
        from: SENDER_EMAIL,
        to: mail,
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
        return false
    }
}

function appendToFile(email) {
    const name = email.split('@')[0];
    const newline = [name, email].join(',') + '\n'
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

    } else if (req.method === 'POST' && req.url === '/newsletter-anmeldung') {

        try {
            const { email, dataCheckbox } = await json(req)
            if (!email, !dataCheckbox) {
                res.writeHead(400, { 'content-type': 'application/json' })
                res.write(JSON.stringify({ error: 'Bitte E-Mail und Zustimmung zur Datenschutzrichtlinie angeben.' }))
                res.end()
                return
            }

            if (!checkRegex(email)) {
                res.writeHead(400, { 'content-type': 'application/json' })
                res.write(JSON.stringify({ error: 'Ungültige E-Mail-Adresse!' }))
                res.end()
                return
            }

            if (!await checkMX(email)) {
                res.writeHead(400, { 'content-type': 'application/json' })
                res.write(JSON.stringify({ error: 'Die angegebene E-Mail-Adresse existiert nicht.' }))
                res.end()
                return
            }

            // if (!await sendEmail(email)) {
            //     res.writeHead(400, { 'content-type': 'application/json' })
            //     res.write(JSON.stringify({ error: 'Die angegebene E-Mail-Adresse existiert nicht.' }))
            //     res.end()
            //     return
            // }

            appendToFile(email)

            res.writeHead(200, {
                'content-type': 'application/json',
            })

            res.end(JSON.stringify({ redirect: '/newsletter-anmeldung' }))

        } catch (error) {
            res.writeHead(500, { 'content-type': 'application/json' })
            res.write(JSON.stringify({ error: 'Serverfehler, bitte später erneut versuchen.' }))
            res.end()
        }

    } else {
        serveFile(req, res, finalhandler(req, res))
    }

})

server.listen(PORT, () => {
    console.log(`Server is listening on port: http://localhost:${server.address().port}`)
})
