/**
 * File: TableOfRecords.js
 * 
 * Copyright (c) 2023 by Dido Solutions. All rights reserved.
 *
 * **Prohibited Activities:**
 *
 * * You cannot copy, modify, distribute, transmit, reproduce, publish,
 * * publicly display, publicly perform, create derivative works, transfer,
 *   or sell any of the content without prior written permission from 
 *   Dido Solutions.
 *
 * **Non-Exclusive License:**
 *
 * * This file is provided "as is" without warranty of any kind, expressed or 
 *   implied.
 * * You are granted a non-exclusive, non-transferable license to use this
 *   file for personal, non-commercial purposes only.
 *
 * **Non-Commercial Use:**
 *
 * * Governments, educational institutions, and tax-exempt/public-benefit 
 *   non-profits are granted a non-exclusive, non-transferable license to 
 *   use this file for non-commercial purposes.
 *
 * **Commercial Use:**
 *
 * * You cannot use this file for your business or profit without 
 *   Dido Solutions' consent (https://didosolutions.com/contact/).
 *
 * **Attribution Notice:**
 *
 * * You must retain this attribution notice in all copies of the file:
 * * Copyright (c) 2023 by Dido Solutions. All rights reserved.
 */

/**
 * @class TableOfRecords
 * @description encapsulates the idea of a table being comprised 
 * set of records.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext           from "./TemplateGlobalContext.js";
import {parse}                         from 'csv-parse/sync';
import FileSystem                      from 'fs';
import FileIO                          from './FileIO.js';
import { compressText,
         eliminateNonAlphanumerics,
         toValidNameChars,
         padLeft,
         padRight,
         center,
         definePseudoElements,
         trim,
         trimLeft,
         trimRight,
         toTitleCase,
         toLowerCase,
         toUpperCase,
         toLowerSnakeCase,
         toUpperSnakeCase,
         toTitleSnakeCase,
         toUpperCamelCase,
         toLowerCamelCase,
         toKebabCase,
         toLowerKebabCase,
         toUpperKebabCase,
         isOn,
         isOff,
         isOnOrOff,
         isNumeric,
         isNull,
         isUndefined,
         isEmpty,
         isUsable,
         isInitialized,
         coalesce,
         compare,
         removeDuplicateWords,
         wordExistsInList,
         startsAndEndsWithCaret,
         startsAndEndsWithChevrons,
         startsAndEndsWithQuotes,
         startsAndEndsWithApostrophe,
         startsAndEndsWithLiteral,
         isPathWithinRoot,
         determineNumberType, 
         isBigIntegerValue, 
         isBigNumberValue, 
         isDecOctetValue, 
         isFloatingPointValue, 
         isHexadecimalValue, 
         isIntegerValue, 
         isIPv4Value, 
         isIPv6Value, 
         isNumericValue, 
         isURIValue, 
         resolveURIs, 
         isEmailValue, 
         isPhoneNumberValue,
         PSEUDO_ELEMENT,
         RULER,
         MAX_ATTEMPTS
        }                              from './TdlUtils.js';
  /* In order to make the following commands visible to the execute command without 
     having to add a namespace, the following functions are individually exported
     from the TdlUtils.js file and then assigned to a global scope.
  */
     global.compressText                = compressText;
     global.eliminateNonAlphanumerics   = eliminateNonAlphanumerics;
     global.padLeft                     = padLeft;
     global.padRight                    = padRight;
     global.center                      = center;
     global.definePseudoElements        = definePseudoElements;
     global.trim                        = trim;
     global.trimLeft                    = trimLeft;
     global.trimRight                   = trimRight;
     global.toValidNameChars            = toValidNameChars;
     global.toTitleCase                 = toTitleCase;
     global.toLowerCase                 = toLowerCase;
     global.toUpperCase                 = toUpperCase;
     global.toLowerSnakeCase            = toLowerSnakeCase;
     global.toUpperSnakeCase            = toUpperSnakeCase;
     global.toTitleSnakeCase            = toTitleSnakeCase;
     global.toUpperCamelCase            = toUpperCamelCase;
     global.toLowerCamelCase            = toLowerCamelCase;
     global.toKebabCase                 = toKebabCase;
     global.toLowerKebabCase            = toLowerKebabCase;
     global.toUpperKebabCase            = toUpperKebabCase;
     global.isOn                        = isOn;
     global.isOff                       = isOff;
     global.isOnOrOff                   = isOnOrOff;
     global.isNumeric                   = isNumeric;
     global.isNull                      = isNull;
     global.isUndefined                 = isUndefined;
     global.isEmpty                     = isEmpty;
     global.isUsable                    = isUsable;
     global.isInitialized               = isInitialized;
     global.coalesce                    = coalesce;
     global.compare                     = compare;
     global.removeDuplicateWords        = removeDuplicateWords;
     global.wordExistsInList            = wordExistsInList 
     global.startsAndEndsWithCaret      = startsAndEndsWithCaret;
     global.startsAndEndsWithChevrons   = startsAndEndsWithChevrons;
     global.startsAndEndsWithQuotes     = startsAndEndsWithQuotes;
     global.startsAndEndsWithApostrophe = startsAndEndsWithApostrophe,
     global.startsAndEndsWithLiteral    = startsAndEndsWithLiteral;
     global.isPathWithinRoot            = isPathWithinRoot;
     global.determineNumberType         = determineNumberType;
     global.isBigIntegerValue           = isBigIntegerValue;
     global.isBigNumberValue            = isBigNumberValue;
     global.isDecOctetValue             = isDecOctetValue;
     global.isFloatingPointValue        = isFloatingPointValue;
     global.isHexadecimalValue          = isHexadecimalValue;
     global.isIntegerValue              = isIntegerValue;
     global.isIPv4Value                 = isIPv4Value;
     global.isIPv6Value                 = isIPv6Value;
     global.isNumericValue              = isNumericValue;
     global.isURIValue                  = isURIValue;
     global.resolveURIs                 = resolveURIs;
     global.isEmailValue                = isEmailValue;
     global.isPhoneNumberValue          = isPhoneNumberValue;

//===== Constants ====
const ascendingOrder  = 1;
const descendingOrder = -1;

//===== Class Definition =====
/**
  * @class TableOfRecords
  * @description Encapsulates a table consisting of a set of records.
  * It supports loading data from a CSV file or from an in-memory LIST or JSON array.
  * @author R. W. Stavros, Ph.D. - Dido Solutions, Inc.
  * @since 10 December 2023
  * @version 1.1
  */
export default class TableOfRecords
{ //===== Private
  /**
   * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
   * @type { TemplateGlobalContext }
   * @private
   */
   #templateGlobalContext;
   #externalFileSpec;
   #columnNames;
   #jsonFileContents;
   #table;

  //===== Constructors 
  /**
   * Constructs a new TableOfRecords instance.
   * It can load data from a CSV file or from in-memory LIST/JSON data.
   * 
   * @param {string|null} externalFileSpec - The filename of the CSV file to load. Use `null` for in-memoryData.
   * @param {TemplateGlobalContext} templateGlobalContext - The global context for template operations.
   * @param {Array|null} memoryData - The in-memory LIST or JSON array. Must be provided if `externalFileSpec`is `null`.
   */
  constructor ( externalFileSpec, templateGlobalContext, memoryData = null, columnAlias = null )
  { if ( !templateGlobalContext )
    { console.log ( '--*** No TemplateGlobalContext provided to TableOfRecords, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    templateGlobalContext.consoleTrace ( 'Starting TableOfRecords Constructor');
    this.#templateGlobalContext = templateGlobalContext;
    this.#resetData();
    if ( memoryData !== null )
    { this.#loadFromMemory ( memoryData, columnAlias ); // Pass alias
    } // End if
    else if ( externalFileSpec ) 
    { this.#loadExternalFile ( externalFileSpec );
    } // End else if
    else 
    { console.log('--*** No valid data source provided, table will be empty.');
      this.#table = [];
    } // End else
    this.#templateGlobalContext.consoleTrace('Finishing TableOfRecords Constructor');
  } // End TableOfRecords constructor

  #resetData()
  { this.#externalFileSpec = null;
    this.#jsonFileContents = [];
    this.#columnNames      = [];
    this.#table            = [];
  } // Ene function resetData

  /**
   * Loads data from an in-memory LIST or JSON structure.
   * 
   * @param {Array} memoryData - The in-memory data (must be an array of objects).
   */
  #loadFromMemory(memoryData, columnAlias = 'Value') 
  { this.#templateGlobalContext.consoleTrace('Starting TableOfRecords.#loadFromMemory');
    this.#resetData();
    // Handle LIST (array of values)
    if ( Array.isArray ( memoryData ) ) 
    { if (!columnAlias) 
      { console.log("--*** Warning: No alias provided for MEMORY LIST, defaulting to 'Value'.");
        columnAlias = 'Value';  
      } // End if
      this.#columnNames = [columnAlias];
      this.#table = memoryData.map(value => ({ [columnAlias]: value })); 
    } // End if Array
    // Handle JSON string (convert it to an object)
    else if ( typeof memoryData === 'string' ) 
    { try 
      { // Convert string into JSON object for processing
        this.#jsonFileContents = JSON.parse ( memoryData );
        memoryData = this.#jsonFileContents; 
      } // End try
      catch ( error ) 
      { console.error("--*** Error parsing in-memory JSON:", error);
        this.#table = [];
        return;
      } // End catch
    } // End else if string
    // Handle JSON objects directly
    else if ( typeof memoryData === 'object' 
         && !Array.isArray ( memoryData ) 
       ) 
    { let keys = Object.keys(memoryData);
      let firstKey = keys[0];  // Assume the first key holds the array
      if ( Array.isArray(memoryData[firstKey]) ) 
      { this.#columnNames = [firstKey];  
        this.#table = memoryData[firstKey].map(value => ({ [firstKey]: value })); 
      } // End if Array
      else 
      { this.#table = [memoryData]; // If it's not an array, treat it as a single-row record
      } // End else
      this.#establishColumnNames();
    } // End if Object
    else 
    { console.log("--*** Unsupported MEMORY data format, loading aborted.");
    } // End else
    this.#templateGlobalContext.consoleTrace('Finishing TableOfRecords.#loadFromMemory');
  } // End function #loadFromMemory

  #loadExternalFile ( externalFileSpec )
  { this.#templateGlobalContext.consoleTrace 
      ( 'Starting TableOfRecords.#loadExternalFile -> ' + externalFileSpec );  
    this.#resetData();
    this.#externalFileSpec = externalFileSpec; // Store filename  
    let fileContent = this.#readFileContent (externalFileSpec ); // Read file content
    if ( fileContent.length > 0 ) 
    { this.processJsonData ( fileContent ); // Process JSON content
    } // End if  
    this.#templateGlobalContext.consoleTrace 
      ( 'Finishing TableOfRecords.loadExternalFile -> ' 
        + this.#jsonFileContents.length 
        + ' lines' 
      );
  } // End function #loadExternalFile
  
  #readFileContent ( fileSpecification ) 
  { this.#templateGlobalContext.consoleTrace ( 'Processing TableOfRecords.#readFileContent' );
    return this.#templateGlobalContext.getFileIO()
      .synchronouslyReadFile 
        ( fileSpecification, false );
  } // End function #readFileContent

  processJsonData ( jsonString ) 
  { this.#templateGlobalContext.consoleTrace ( 'Starting TableOfRecords.processJsonData' );
  
    try 
    { // ✅ Check if it looks like CSV (has newlines & commas but no valid JSON brackets `{}` or `[]`)
      if ( jsonString.includes('\n') && jsonString.includes(',') && !jsonString.trim().startsWith('{') ) 
      { // console.log("--+++ Detected CSV-like format, converting...");
        this.#jsonFileContents = this.#convertCsvToJson(jsonString); // ✅ Convert CSV to JSON
      } 
      else 
      { this.#jsonFileContents = JSON.parse(jsonString); // ✅ Parse normal JSON
      }
  
      // ✅ Store parsed data as table
      if ( Array.isArray ( this.#jsonFileContents ) ) 
      { this.#table = this.#jsonFileContents; 
      } 
      else if ( typeof this.#jsonFileContents === 'object' ) 
      { this.#table = [this.#jsonFileContents]; // ✅ Wrap object in array
      } 
      else 
      { console.log("--*** Unsupported JSON format, loading aborted.");
      }
  
      this.#establishColumnNames();
    } 
    catch ( error ) 
    { console.error("--*** JSON Parsing Error:", error);
      this.#jsonFileContents = []; // Fallback to empty array
    }
  
    this.#templateGlobalContext.consoleTrace ( 'Finishing TableOfRecords.processJsonData' );
  } // End function processJsonData

  #convertCsvToJson ( csvString ) 
  { this.#templateGlobalContext.consoleTrace ( 'Starting TableOfRecords.#convertCsvToJson' );
    let rows = csvString.split('\n').map(row => row.trim()).filter(row => row.length > 0);
  
    if ( rows.length < 2 ) 
    { console.error("--*** CSV format error: Not enough rows to parse.");
      return [];
    } // End if
  
    let headers = rows[0].split(',').map(header => header.replace(/^"|"$/g, '').trim()); // Remove quotes
    let jsonData = rows.slice(1).map(row => 
      { let values = row.split(',').map(value => value.replace(/^"|"$/g, '').trim());
        let obj = {};
        headers.forEach((header, index) => 
          { obj[header] = values[index] || null;
          }); 
        return obj;
      });
      this.#templateGlobalContext.consoleTrace ( 'Finishing TableOfRecords.#convertCsvToJson' );
    return jsonData;
  } // End function #convertCsvToJson
  
  
  #establishColumnNames ()
  { this.#templateGlobalContext.consoleTrace ( 'Starting TableOfRecords.establishColumnNames ' );
    this.#columnNames = [];
    if ( this.#table.length >= 0 )
    { let firstRow = this.#table[0];
      let parsedResponse = JSON.parse(JSON.stringify ( firstRow ) );
      for ( let key in parsedResponse )
          { // let value = toTitleSnakeCase ( key );
            this.#columnNames.push ( key );
          }
    } // End if
    this.#templateGlobalContext.consoleTrace 
      ( 'Finishing TableOfRecords.establishColumnNames -> "' 
        + this.#columnNames + '"' 
      );
    return this.#columnNames;
  } // End function establishColumnNames

  getTable()
  { return this.#table;
  } // End function Table

  getColumnNames()
  { return this.#columnNames;
  } // End function getColumnNames

  defineAttributes ( recordNumber  )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TableOfRecords.defineAttributes -> ' +recordNumber );
    let keyCounter = -1;
    if ( ! recordNumber || recordNumber < 0 )
    { let errorMessage = '--*** recordNumber must be natural number';
      console.log ( errorMessage );
      recordNumber = 0;
    } // End if
    let record = this.#table [ recordNumber ] 
    var keys = Object.keys ( record );
    console.log ( '##### 4100 tableRecord: ' + record );
    console.log ( '##### 4000 keys : ' + keys );
    for ( let key of keys )
    { keyCounter++;
      console.log ( '##### ' + keyCounter + ' _#DEFINE ' + key + ' ' + record [ key ] );
    } // End for
    this.#templateGlobalContext.consoleTrace ( 'Finishing TableOfRecords.defineAttributes -> ' +keyCounter );
    return keyCounter;
  } // End function defineAttributes

  dumpJsonFileContent ( tableOfInterest )
  { if ( !tableOfInterest )
    { tableOfInterest = this.#table;
    } // End if
    let jsonString = '';
    for ( let recordCounter = 0; 
              recordCounter < tableOfInterest.length; 
              recordCounter++ 
        )
    { let response = tableOfInterest [ recordCounter ];
      jsonString += '\n [' + recordCounter + '] ' + JSON.stringify ( response );
    } // End for 
    return jsonString;
  } // End function dumpJsonFileContent

    where ( whereExpression )
    { this.#templateGlobalContext.consoleTrace ( 'Starting TableOfRecords.where -> ' + whereExpression );
      let localResult = this.#table;
      if ( !isEmpty ( whereExpression ) )
      { try
        { const filterFunction 
            = new Function 
                ( 'row', 
                  'return ' + whereExpression + ';'
                );
          localResult 
            = this.#table.filter
                ( ( row ) =>
                     { return filterFunction ( row );
                     }
                ); 
      } // End try
      catch ( message )
      { console.log ( '--*** Expression is not executable, Expression ignored: "' + whereExpression + '"' );
        console.log ( '--*** ' + message );
      } // End catch
    } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing TableOfRecords.where' );
      return localResult;
    } // End function where

    newWhere ( whereExpression )
    { console.log  ( '--+++ Starting TableOfRecords.newWhere -> ' + whereExpression );
      let localResult;
      try
      { localResult 
              = this.#table.filter
                ( (row ) =>
                    { let filterFunction 
                        = Function
                          ( 'row',
                            `let localResult;
                            console.log ( '!!!!! 100' );
                             let entityName = toUpperSnakeCase ( row.Entity_Name.trim() );
                             let targetTableName = toUpperSnakeCase ( 'Ecosystem' );
                             console.log ( '!!!!! 200 localCompare: ' + entityName.localeCompare(targetTableName) );
                             console.log ( '!!!!! localeCompare: ' + (entityName.localeCompare(targetTableName) === 0 ));
                             console.log ( '!!!!! 300' );
                              localResult = ( entityName.localeCompare(targetTableName) === 0 );
                              // localResult = true;
                              console.log ( '!!!!! 400' );
                              console.log ( '!!!!! localResult: ' + localResult + ', row: ' + entityName );
                              console.log ( '!!!!! 500 : ' + localResult );
                              return localResult;
                            `
                          );
                      return filterFunction( row );
                    } // end filter function
                );
      } // End try
      catch ( message )
      { console.log ( '--*** Expression is not executable, Expression ignored: "' + whereExpression + '"' );
        console.log ( '--*** ' + message );
      } // End catch
      console.log  ( '--+++ Finishing TableOfRecords.newWhere' );
      return localResult;
    } // End function newWhere

    getSortingColumns ( listOfColumnNames )
    { this.#templateGlobalContext.consoleTrace 
        ( 'Starting TableOfRecords.getSortingColumns -> ' + listOfColumnNames );
      let sortingColumns    = [];
      let ascendingFlags    = Array ( listOfColumnNames.length ).fill ( ascendingOrder );
      for ( let columnCounter = 0;  columnCounter < listOfColumnNames.length; columnCounter++ )
      { let columnName = listOfColumnNames[columnCounter].trim();
        if ( columnName.indexOf (' ' ) > 0 )
        { let temp = columnName.split(' ');
          columnName = temp[0];
          let ascendingIndicator = temp[1].trim().toUpperCase();
          if ( ascendingIndicator === 'DESC' )
          { ascendingFlags [ columnCounter ] = descendingOrder;
          } // End if
          sortingColumns.push ( columnName.trim().toUpperCase() );
        } // End if
        else
        { sortingColumns = columnName;
        } // End if
      } // End for
      this.#templateGlobalContext.consoleTrace 
        ( 'Finishing TableOfRecords.getSortingColumns ->\nsortingColumns->\n' 
          + sortingColumns 
          + ' ->\ascendingFlags->\n' 
          + ascendingFlags
        );
      return [ sortingColumns, ascendingFlags ];
    } // End function getSortingColumns

    validateSortingColumns ( sortingColumns )
    { this.#templateGlobalContext.consoleTrace
        ( 'Starting TableOfRecords.validateSortingColumns -> ' 
          + sortingColumns 
          + ' typeof ' 
          + typeof sortingColumns 
        );
      let sortingList = [];
      let columnName = sortingColumns;
      let columnOrdering = 'ASC';
      if ( typeof columnName === 'string' )
      { sortingColumns = sortingColumns.trim().split ( ',');
        for ( let column of sortingColumns )
        { columnName = column.trim().toUpperCase();
          if ( columnName.indexOf ( ' ' ) >= 0 )
          { columnName = column.trim().split( ' ' );
            columnOrdering = columnName[1];
            columnName = columnName[0].trim().toUpperCase();
          } // End if
          let newColumSort = new Object();
          newColumSort.key    = columnName;
          newColumSort.order  = columnOrdering;
          sortingList.push ( newColumSort );
          if ( ! this.#columnNames.includes ( columnName ) )
          { console.log ( '--*** the specified column: ' + sortingColumns + ' - not defined in table: ' + this.#externalFileSpec + '\n--** column ignored' );
          } // End for
        } // End for
      }
      this.#templateGlobalContext.consoleTrace ( 'Finishing TableOfRecords.validateSortingColumns -> ' + JSON.stringify ( sortingList ) );
      return sortingList;
    } // End function validateSortingColumns
    
    orderBy ( keys ) 
    { return this.#table.sort
      ( 
        function sort
          ( firstRow, 
            secondRow, 
            sortingKeys=keys
          )
        { // Get order and key based on structure
          function getProperty ( theObject, propertyToFind )
          { propertyToFind = propertyToFind.toUpperCase();
            let localResult;
            for ( let key in theObject )
            { if ( key.toUpperCase() == propertyToFind ) 
               { localResult = theObject [ key] ;
               } // End if
            } // End for
            return localResult;
          } // end function getProperty

          let compareKey = ( sortingKeys[0].key ) 
            ? sortingKeys[0].key // True
            : sortingKeys[0];    // False
          let order = sortingKeys[0].order || 'ASC'; // ASC || DESC ( default to ASC)
          order = order.toUpperCase();
          if ( order !== 'ASC' && order !== 'DESC' )
          { let errorMessage = '--*** Ordering of "'+ order + '" is not valid, must be "ASC" or "DESC" ';
          console.log ( errorMessage  );
          throw errorMessage;
          } // end if
          let firstValue  = getProperty ( firstRow, compareKey );
          let secondValue = getProperty ( secondRow, compareKey );

          if ( ! firstValue )
          { let errorMessage = '--*** Key "'+ compareKey.toUpperCase() + '" NOT found in table ';
            console.log ( errorMessage  );
            throw errorMessage;
          } // end if
          //else
          { // Calculate compare value and modify based on order
            let compareValue 
                   = firstValue
                     .localeCompare 
                       ( secondValue 
                       );
            compareValue = ( order.toUpperCase() === 'DESC' ) 
              ? compareValue * descendingOrder // True
              : compareValue;                  // False
            // See if the next key needs to be considered 
            const checkNextKey 
              = ( compareValue === 0 )  
                && ( sortingKeys.length !== 1 )
            // Return compare value
            return ( checkNextKey ) 
              ? sort ( firstRow, secondRow, sortingKeys.slice ( 1 )  ) // True
              : compareValue;                                         // False
          } // end if
        } // end function sort
      )
   } //  End function orderBy

  toJSON()
  { this.#templateGlobalContext.consoleTrace ( 'Starting TableOfRecords.TableOfRecords:toJSON');
    let jsonText
      =  "\n{\n"
         + "  \"externalFileSpec\"        : \"" + this.#externalFileSpec + "\",\n"
         + "  \"columnNames\"             : \"" + this.#columnNames + "\",\n"
         + this.dumpJsonFileContent()
         + '\n'
         +"}\n";
     this.#templateGlobalContext.consoleTrace ( 'Finishing TableOfRecords.TableOfRecords:toJSON -> \n' +jsonText );
    return jsonText
  } // End function toJSON

} // End class TableOfRecords

function unitTestTable()
{ let localResult;
  let jsonString = '';
  let table;
  let externalFileSpec = './Data/test.csv';
  externalFileSpec = './Data/dido_cm_entity_attribute.csv';
  let templateGlobalContext = new TemplateGlobalContext();
  templateGlobalContext.setTraceState ( false );
  let tableOfRecords = new TableOfRecords ( externalFileSpec, templateGlobalContext  );
  // console.log ( tableOfRecords.toJSON() );

  templateGlobalContext.setTraceState ( false );
  let orderByString = 'Dollars, Place ASC, Greeting DESC';
  orderByString = 'Place ASC, Greeting DESC';
  orderByString = 'Greeting ASC';
  orderByString = 'Package_Name, Entity_Name, Ordinal_Position';

  let parsedSortColumns = tableOfRecords.validateSortingColumns ( orderByString );
  //console.log ( '=== temp: ' +JSON.stringify ( parsedSortColumns ) );
  let sortedTable = tableOfRecords.orderBy ( parsedSortColumns );
  for ( let recordCounter = 0; 
            recordCounter < sortedTable.length; 
            recordCounter++ 
      )
  { let response = sortedTable [ recordCounter ];
    jsonString += '\n' + JSON.stringify ( response );
  } // End for 
  console.log ( '=== orderByString ->\n' + orderByString );
  //console.log ( jsonString );
  //console.log ( 'tableOfRecords ->\n' + tableOfRecords.toJSON() );
  templateGlobalContext.setTraceState ( false );

  // let filteredResults = tableOfRecords.where ( "row.Dollars >= '$300.00'" );
  let filteredResults = tableOfRecords.where ( "toUpperSnakeCase(row.Entity_Name.trim()) === toUpperSnakeCase('Ecosystem'.trim())" );
  // let filteredResults = tableOfRecords.newWhere ( "toUpperSnakeCase(row.Entity_Name.trim() === toUpperSnakeCase('Ecosystem'.trim()" );

  console.log ( '=== Length of Results: ' + filteredResults.length );
  table = tableOfRecords.getTable();
  return;

  // localResult = tableOfRecords.orderBy ( [{key:'Dollars',order:'asc'}, {key:'Place',order:'desc'}, {key:'Greeting',order:'desc'}] );
  localResult = tableOfRecords.orderBy ( [{key:'Entity_Name',order:'asc'}, {key:'Ordinal_Position',order:'desc'}] );

  console.log ( '@@@ localResult : ' + localResult);
  for ( let resultCounter = 0; resultCounter < localResult.length; resultCounter++ )
  { let result = localResult [ resultCounter ];
    console.log ( '@@@ ' + resultCounter + '] Place: ' + result.Place  + ' Dollars: ' + result.Dollars );
  } // End for
  templateGlobalContext.setTraceState ( false );
} // End function unitTestTable

   
/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestTable();
} // End if
