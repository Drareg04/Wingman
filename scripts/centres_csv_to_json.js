/*
  Convert OpenDataBCN CSV (educational facilities) to a compact JSON for the app.

  Output structure per item:
    { name, addresses_road_name, addresses_town }

  Usage (macOS/zsh):
    node scripts/centres_csv_to_json.js \
      /absolute/path/opendatabcn_llista-equipaments_educacio-csv.csv \
      src/data/educational_centres.json
*/

const fs = require('fs')
const path = require('path')

function parseCSVLine(line) {
  // Minimal CSV parser supporting quotes and commas inside quotes.
  const out = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (ch === '"') {
      // double quote inside quoted string
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }

    cur += ch
  }
  out.push(cur)
  return out
}

const cleanHeader = h => {
  if (!h) return ''
  return h
    .replace(/\uFEFF/g, '') // BOM
    .replace(/\0/g, '') // NULs from UTF-16 decoding issues
    .trim()
}

function main() {
  const input = process.argv[2]
  const output = process.argv[3]

  if (!input || !output) {
    console.error('Missing args. Example: node scripts/centres_csv_to_json.js <input.csv> <output.json>')
    process.exit(1)
  }

  // Read raw buffer to detect UTF-16
  const buf = fs.readFileSync(input)
  let csv

  // UTF-16LE BOM: FF FE, UTF-16BE BOM: FE FF
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    csv = buf.toString('utf16le')
  } else if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    // BE not common here; try swap bytes and decode
    const swapped = Buffer.allocUnsafe(buf.length)
    for (let i = 0; i < buf.length; i += 2) {
      swapped[i] = buf[i + 1]
      swapped[i + 1] = buf[i]
    }
    csv = swapped.toString('utf16le')
  } else {
    csv = buf.toString('utf8')
  }

  const lines = csv.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) {
    console.error('CSV appears empty')
    process.exit(1)
  }

  const headers = parseCSVLine(lines[0]).map(h => cleanHeader(h))

  const idxName = headers.indexOf('name')
  const idxRoad = headers.indexOf('addresses_road_name')
  const idxTown = headers.indexOf('addresses_town')

  if (idxName === -1 || idxRoad === -1 || idxTown === -1) {
    console.error('Required columns not found. Need: name, addresses_road_name, addresses_town')
    console.error('Found headers:', headers)
    process.exit(1)
  }

  const seen = new Set()
  const result = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    const item = {
      name: (row[idxName] || '').trim(),
      addresses_road_name: (row[idxRoad] || '').trim(),
      addresses_town: (row[idxTown] || '').trim(),
    }

    if (!item.name) continue

    // basic dedupe
    const key = `${item.name}__${item.addresses_road_name}__${item.addresses_town}`
    if (seen.has(key)) continue
    seen.add(key)

    result.push(item)
  }

  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify(result, null, 2), 'utf8')
  console.log(`Wrote ${result.length} centres to ${output}`)
}

main()
