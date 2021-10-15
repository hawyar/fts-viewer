const fs = require('fs')
const readline = require('readline')
const path = require('path')

const knownKeys = [
  'Researcher',
  'File Description',
  'Actual File Name',
  'Date Extracted',
  'Format',
  'Columns in File',
  'Exact File Quantity (Rows)',
  'Maximum Possible Record Length',
  'Exact File Size in Bytes with 512 Blocksize',
  'Request #',
  'SAS v8.x or Greater Compatible Read-In Program',
  'SAS v6.x or Greater Compatible Read-In Program',
  'Standard Layout Attached with Data Formatting',
  'Help',
  'Note',
]

async function start() {
  if (process.argv.length < 3) {
    console.log('Usage: node index.js <file>')
    process.exit(1)
  }

  read(process.argv[2])
}

function read(file) {
  const EndOfDocument = '- End of Document'

  const rl = readline.createInterface({
    input: fs.createReadStream(file, 'ascii'),
  })

  let parsed = {
    raw: '',
    file: '',
    lineCount: '',
    columns: [],
  }

  let count = 0

  parsed.file = file

  let start = 0
  let end = 0

  rl.on('line', (line) => {
    if (line.startsWith('----')) {
      start = count + 1
    }

    if (start === count && start !== end) {
      //   parsed.columns.push(line.split(/\s+/))
      console.log(line)
    }

    if (line.startsWith(EndOfDocument)) {
      end = count
    }

    knownKeys.forEach((key) => {
      if (line.indexOf(key) === 0) {
        const val = line.substring(key.length + 2).trim()
        key = key.trim().replace(/\s/g, '')

        if (parsed[key]) {
          if (Array.isArray(parsed[key])) {
            parsed[key].push(val)
          } else {
            parsed[key] = [parsed[key], val]
          }
        } else {
          parsed[key] = val
        }
      }
    })

    count++
  })

  rl.on('close', () => {
    parsed.lineCount = count
    console.log(parsed)
    console.log(`Start: ${start}`)
    console.log(`End: ${end}`)
  })
}

start()
