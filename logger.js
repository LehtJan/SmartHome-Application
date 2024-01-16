const fs = require('fs')

const fileName = 'dataOperations.log'
const log = (entry) => {
    const isoTimestamp = new Date().toISOString()
    let logRow = entry + ' ' + fileName + ' @ ' + isoTimestamp + '\n'
    fs.appendFile(fileName , logRow, (err) => {
        if (err) {
        console.log(err)
        }
    })
}

module.exports = {log}