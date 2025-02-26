/**
 * File: ValidateSettings.js
 * 
 * Copyright (c) 2023 to present by Dido Solutions. All rights reserved.
 * 
 * **License:** MIT
 * This script validates `TdlSettings.json` against `tdl_settings.schema.json`.
 * 
 * **Last Revision:** 23 February 2025 - Initial implementation.
 * 
 * **Reviewers (Human):**
 * - R. W. Stavros, Ph.D. - Code Review
 * - John Doe - Security Review
 * 
 * **Automated Reviews:** 
 * - Hamish I. MacCloud, AIA - AI Code Review
 * - ESLint - Code Linting (Last run: 22 February 2025)
 */

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

/**
 * @file ValidateSettings.js
 * @description Validates `TdlSettings.json` against `tdl_settings.schema.json`.
 * @author R. W. Stavros, Ph.D. - Dido Solutions, Inc.
 * @since 23 February 2025
 * @version 1.0
 * @reviewer R. W. Stavros, Ph.D. - Code Review
 * @reviewer John Doe - Security Review
 * @automated_review Hamish I. MacCloud, AIA - AI Code Review
 * @automated_review ESLint - Code Linting (Last run: 22 February 2025)
 */

// ---------- Constants
const settingsFile = path.resolve('Data/TdlSettings.json');
const schemaFile = path.resolve('Data/tdl_settings.schema.json');

// ---------- Load JSON file
/**
 * Loads a JSON file from disk.
 * @param {string} filePath - Path to the JSON file.
 * @returns {object} Parsed JSON data.
 */
function loadJSON ( filePath ) 
{ try 
  { return JSON.parse ( fs.readFileSync ( filePath, 'utf-8' ) );
  } // End try
  catch ( error ) 
  { console.error ( `ERROR: Unable to load ${filePath}: ${error.message}` );
    process.exit ( 1 );
  } // End catch
} // End loadJSON

// ---------- Initialize AJV
const ajv = new Ajv ( { allErrors: true } );
const schema = loadJSON ( schemaFile );
const validate = ajv.compile ( schema );
const settings = loadJSON ( settingsFile );

// ---------- Perform validation
const isValid = validate ( settings );

if ( isValid ) 
{ console.log ( "✅ TdlSettings.json is valid." );
  process.exit ( 0 );
} // End if
else 
{ console.error ( "❌ TdlSettings.json validation failed." );
  console.error ( validate.errors );
  process.exit ( 1 );
} // End else
