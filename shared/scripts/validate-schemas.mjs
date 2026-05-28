#!/usr/bin/env node
/**
 * Validate shared JSON Schemas and golden fixtures (CI contract gate).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHARED_ROOT = path.resolve(__dirname, '..')
const SCHEMAS_DIR = path.join(SHARED_ROOT, 'schemas')
const FIXTURES_DIR = path.join(SHARED_ROOT, 'fixtures')

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)

const validators = new Map()

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, 'utf8'))
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(dir, name))
}

let failed = false

for (const schemaPath of listJsonFiles(SCHEMAS_DIR)) {
  const schema = readJson(schemaPath)
  const id = schema.$id ?? path.basename(schemaPath)
  try {
    const validate = ajv.compile(schema)
    validators.set(id, validate)
    console.log(`[schemas] OK compile ${path.basename(schemaPath)}`)
  } catch (err) {
    failed = true
    console.error(`[schemas] FAIL compile ${schemaPath}:`, err.message)
  }
}

const fixtureChecks = [
  {
    fixture: 'event-envelope-valid.json',
    schemaId: 'https://smart-vms.local/schemas/event-envelope/1.0',
  },
  {
    fixture: 'detection-payload-valid.json',
    schemaId: 'https://smart-vms.local/schemas/detection-payload/1.0',
  },
]

for (const { fixture, schemaId } of fixtureChecks) {
  const fixturePath = path.join(FIXTURES_DIR, fixture)
  if (!fs.existsSync(fixturePath)) {
    failed = true
    console.error(`[schemas] FAIL missing fixture ${fixture}`)
    continue
  }
  const validate = validators.get(schemaId)
  if (!validate) {
    failed = true
    console.error(`[schemas] FAIL schema not compiled: ${schemaId}`)
    continue
  }
  const data = readJson(fixturePath)
  if (!validate(data)) {
    failed = true
    console.error(`[schemas] FAIL fixture ${fixture}:`, validate.errors)
  } else {
    console.log(`[schemas] OK fixture ${fixture}`)
  }
}

if (failed) process.exit(1)
console.log('[schemas] All schema checks passed')
