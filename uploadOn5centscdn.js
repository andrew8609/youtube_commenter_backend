const ftp = require("basic-ftp")
const fs = require('fs')

async function uploadFiles(base64, name, type) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: process.env.HOST_5CENTSCDN,
            user: process.env.USER_5CENTSCDN,
            password: process.env.PASS_5CENTSCDN,
            secure: false
        })
        fs.writeFile(`sample.${type}`, base64.split(';base64,')[1], 'base64', (err) => {
            if(err) {
                return false
            }
         })

        await client.uploadFrom(`sample.${type}`, `/profile_images/${name}.${type}`)


        fs.unlink(`sample.${type}`, (err) => {
            if(err) {
                return false
            } 
        })
        client.close()
        return true
    }
    catch (err) {
        client.close()
        return false
    }
    
}

module.exports = { uploadFiles }