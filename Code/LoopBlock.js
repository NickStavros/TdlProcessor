/**
 * File: LoopBlock.js
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
 * @class LoopBlock
 * @description describes the definition of loops covering not only the 
 * statements in the loop but also the data being looped over.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from "./TemplateGlobalContext.js";
import TemplateStatement     from './TemplateStatement.js';
import TableOfRecords        from './TableOfRecords.js';
import Cursor                from './CursorStatement.js';
import CursorDefinitions     from './CursorDefinitions.js';
import FileIO                from './FileIO.js';
import process               from "process";
import Path                  from "path";
import * as TdlUtils         from './TdlUtils.js';
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
      }                       from './TdlUtils.js';

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

export const LIST_OF_MOVE_WORDS = [ 'TOP', 'BOTTOM', 'UP', 'PREVIOUS', 'DOWN', 'NEXT' ];

//===== Class Definitions =====
export default class LoopBlock
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
  
    #loopName;       
    #validBlock;
    #beginLineNumber;
    #currentLineNumber;
    #endLineNumber;
  
    #cursor;
    #templateFile;
    #loopCounter;
    #fromComponents; 
    #whereComponents;
  
    #tableRows;
    #originalTableRows;
    #filteredRows;
    #filteredRowCount;
    #currentRowNumber;
    #totalRows;

  //===== Constructors 
  constructor ( loopName, currentLineNumber, templateFile, templateGlobalContext ) 
  { if ( !templateGlobalContext ) { 
      console.log ( '--*** No TemplateGlobalContext provided to LoopBlock, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    this.#templateGlobalContext = templateGlobalContext;
    this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock Constructor' );
    if ( !loopName ) 
    { loopName = 'loop';
    } // End if
    this.setLoopName ( loopName );
    this.#setTemplateFile ( templateFile );
    // Get cursor definition
    this.#cursor = this.#templateGlobalContext.getCursorDefinitions().get ( loopName );
    if ( !this.#cursor ) 
    { console.log ( "--*** Unable to find loopName: '" + loopName + "'" );
      return;
    } // End if
    this.#fromComponents = this.#cursor.getFromComponents();
    let kindOfSelect = this.#cursor.getTypeOfCursor().toUpperCase();
    // Handle FILE-based sources
    if ( ['CSV', 'JSON', 'SQL', 'XMI'].includes ( kindOfSelect ) ) 
    { let fromFileSpec = this.#cursor.getFromFileSpec(); 
      if ( !fromFileSpec ) 
      { console.log("--*** A valid filespec not found for " + kindOfSelect + " cursor.");
        console.log("--*** filespec provided:  '" + fromFileSpec  + "' " );
      } // End if
      else 
      { this.#tableRows = new TableOfRecords(fromFileSpec, templateGlobalContext);
        this.#filteredRows = this.#tableRows;
        this.#filteredRowCount = this.#filteredRows.length;
        this.defineRowAttributes( 0 );
      } 
    } // End if
    else if ( kindOfSelect === 'MEMORY' ) 
    { let memorySourceType = this.#cursor.getMemorySourceType(); 
      let inlineData = this.#cursor.getInlineMemoryData(); // ✅ Now correctly populated
    
      if ( !inlineData || inlineData.length === 0 ) 
      { console.log("--*** No inline data found for MEMORY cursor.");
        return;
      } // End if
    
      if ( memorySourceType === 'LIST' ) 
      { let columnAlias = this.#cursor.getQueryComponents().get('SELECT')[0][1];
        this.#tableRows 
          = new TableOfRecords 
            ( null, 
              templateGlobalContext, 
              inlineData, 
              columnAlias
            );
        this.#filteredRows = this.#tableRows;
        this.defineRowAttributes( 0 );
        this.#filteredRowCount = this.#filteredRows.length;
        // ✅ Ensure first row attributes are initialized
        if ( this.#tableRows.getTable().length > 0 ) 
        { this.defineRowAttributes( 0 ); // ✅ Initialize row attributes before looping
        } // End if
      } // End if
      else if ( memorySourceType === 'JSON' ) 
      { this.#tableRows = new TableOfRecords 
          ( null, 
            templateGlobalContext,
            inlineData
          );
        this.#filteredRows = this.#tableRows;
        this.#filteredRowCount = this.#filteredRows.length;
      } // End else if
      else 
      { console.log("--*** Unsupported MEMORY source type: " + memorySourceType);
      } // End else
    } // End else if        
    else 
    { console.log ( "--*** Unsupported data source type: " + kindOfSelect );
      return;
    } // End else
    this.#originalTableRows = [];
    this.#whereComponents = this.#cursor.getWhereComponents();
    let whereExpression = '';
    if ( this.#whereComponents )
    { for ( let whereComponent of this.#whereComponents )
      { whereExpression += whereComponent[0] + ' ' + whereComponent[1];
      } // End for
    } // End if
    whereExpression = this.#templateGlobalContext.getTdlUtils().expandVariableNames ( whereExpression );
    this.#filteredRows = this.#tableRows.where ( whereExpression );
    this.defineRowAttributes( 0 );
    this.#filteredRowCount = this.#filteredRows.length;
    // Ensure metadata is correctly set for looping
    this.#setupRowCount( this.#tableRows.getTable().length );  // Set total rows
    
    if ( this.#tableRows.getTable().length > 0 )
    { this.#setRowNumber( 0 );  // Start at the first row
    } // End if
    else 
    { console.log("--*** Warning: No rows available for looping.");
      this.#setRowNumber( -1 ); // Indicate an empty table
    } // End else
    
    this.reset ( currentLineNumber );
    this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock Constructor' );
  } // End constructor

  reset ( newBeginningNumber )
  { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.reset' );
    if ( typeof newBeginningNumber !== 'number' )
    { newBeginningNumber = this.#beginLineNumber;
    } // End if
    this.#setLoopCounter      ( 1 );
    this.setBeginLineNumber   ( newBeginningNumber );
    this.setCurrentLineNumber ( newBeginningNumber+1 );
    let endLineNumber         = this.#findEndLoop ();
    this.#originalTableRows   = this.#tableRows.getTable().slice ( newBeginningNumber, endLineNumber );
    this.setEndLineNumber     ( endLineNumber );
    this.setValidBlock        ( this.#endLineNumber > this.#beginLineNumber && this.#endLineNumber > this.#currentLineNumber );
    this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.reset' );
  } // End function reset
  
  //===== Looping Operations 

    #findEndLoop ()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.#findEndLoop ' );
      let foundEndLoop = false;
      let lineNumber = this.#currentLineNumber;
      for ( lineNumber = this.#currentLineNumber;
            lineNumber < this.#templateFile.length;
            lineNumber++
          )
      { let lineOfCode = this.#templateFile [ lineNumber ];
        let templateStatement = new TemplateStatement ( lineOfCode, this.#templateGlobalContext );
        let operationKind = templateStatement.getKindOfText()[0];
        if ( templateStatement.isMetaCommand() 
             && ( operationKind === 'END_LOOP' )
           )
        { foundEndLoop = true;
          break;
        } // End if
      } // End for
      if ( ! foundEndLoop )
      { lineNumber = this.#beginLineNumber;
        let errorMessage = '--*** No END LOOP found in file, loop is ignored.'
        console.log ( errorMessage );
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.#findEndLoop -> ' + lineNumber );
      return lineNumber;
    } // End function #findEndLoop
  
    #setLoopCounter ( newValue )
    { if ( typeof newValue === 'number' )
      { this.#loopCounter = Math.max ( newValue, 1 );
      } // End if
      else
      { this.#loopCounter = 1;
      } // End else
      this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.#setLoopCounter -> ' + newValue );
      this.#defineLoopCounter ( this.#loopCounter );
    } // End function #setLoopCounter
  
    #defineLoopCounter ( varValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.#defineLoopCounter -> ' + varValue );
      let varName = this.#loopName + PSEUDO_ELEMENT + 'loopCounter';
      this.#templateGlobalContext.getLocalVariableStack().set ( varName, varValue );
      // this.#defineRowNumber ( this.#currentRowNumber );
      this.isFirstRow ();
      this.isLastRow ();
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.#defineLoopCounter' );
    } // End function #defineLoopCounter
  
    #incrementLoopCounter ( )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.#incrementLoopCounter' );
      if ( typeof this.#loopCounter !== 'number' )
      { this.#loopCounter = 0;
      } // End if
      this.#loopCounter++;
      this.#defineLoopCounter ( this.#loopCounter );
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.#incrementLoopCounter -> ' + this.#loopCounter );
    } // End function #incrementLoopCounter

  //===== Data Row Operations 

    getCurrentRowNumber()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.getCurrentRowNumber' );
      if ( typeof this.#currentRowNumber !== 'number' )
      { this.#currentRowNumber = -1;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.getCurrentRowNumber -> ' + this.#currentRowNumber );
      return this.#currentRowNumber;
    } // End function getCurrentRowNumber
  
    getCurrentRow()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.getCurrentRow' );
      let localResult = this.#filteredRowCount[ this.getCurrentRowNumber() ];
      this.#templateGlobalContext.consoleTrace
        ( 'Finishing LoopBlock.getCurrentRow ->\n' + JSON.stringify ( localResult )
        );
      return localResult;
    } // End function getCurrentRow

    getRowCount()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.#getRowCount -> ' + newValue );
      if ( typeof this.#filteredRowCount !== 'number' )
      { this.#filteredRowCount = this.#filteredRows.length;
      } // End if
      return this.#filteredRowCount;
    } // End function getRowCount

    isFirstRow()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.isFirstRow -> ' + this.getCurrentRowNumber() );
      let localResult = false;
      if ( this.getCurrentRowNumber() < 1 )
      { localResult = true;
      } // End if
      let varName = this.#loopName + PSEUDO_ELEMENT + 'isFirstRow';
      this.#templateGlobalContext.getLocalVariableStack().set ( varName, localResult );
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.isFirstRow -> ' + localResult );
      return localResult;
    } // End function isFirstRow

    isLastRow()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.isLastRow -> ' + this.#currentRowNumber );
      let localResult = false;
      if ( (this.#currentRowNumber+1) === this.#filteredRows.length )
      { localResult = true;
      } // End if
      let varName = this.#loopName + PSEUDO_ELEMENT + 'isLastRow';
      this.#templateGlobalContext.getLocalVariableStack().set ( varName, localResult );
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.isLastRow -> ' + localResult );
      return localResult;
    } // End function isLastRow

    #setupRowCount ( rowCount )
    { if ( typeof rowCount !== 'number' )
      { rowCount = this.#filteredRows.length;
      } // end if
      this.#filteredRowCount = rowCount;
      if ( typeof this.#totalRows !== 'number' )
      { this.#totalRows = this.#tableRows.getTable().length;
      } // End if
      let varName = this.#loopName + PSEUDO_ELEMENT + 'rowCount';
      this.#templateGlobalContext.getLocalVariableStack().set ( varName, rowCount );
      this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.#setupRowCount -> ' + rowCount );
      return rowCount;
    } // End function #setRowCount
  
    #setRowNumber ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.#setRowNumber -> ' + newValue );
      if ( typeof newValue === 'number' )
      { this.#currentRowNumber = Math.max ( newValue, -1 );
      } // End if
      else
      { this.#currentRowNumber = -1;
      } // End else
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.#setRowNumber -> ' + this.#currentRowNumber );
      this.#defineRowNumber ( this.#currentRowNumber );
    } // End function #setRowNumber
  
    #defineRowNumber ( varValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.#defineRowCounter -> ' + varValue );
      if ( typeof varValue !== 'number' )
      { varValue = 0;
      } // End if
      let varName = this.#loopName + PSEUDO_ELEMENT + 'rowNumber';
      this.#templateGlobalContext.getLocalVariableStack().set ( varName, varValue );
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.#defineRowNumber -> '+ varValue);
      return varValue;
    } // End function #defineRowNumber
  
    #incrementRowNumber ( )
    { this.#templateGlobalContext.consoleTrace
        ( 'Starting LoopBlock.#incrementRowNumber -> ' 
          + this.#currentRowNumber 
        );
      if ( typeof this.#currentRowNumber !== 'number' )
      { this.#currentRowNumber = -1;
      } // End if
      this.#currentRowNumber++;
      this.#setRowNumber       ( this.#currentRowNumber );
      // this.#defineRowNumber    ( this.#currentRowNumber );
      this.defineRowAttributes ( this.#currentRowNumber );
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.#incrementRowNumber -> ' + this.#currentRowNumber );
      return this.#currentRowNumber;
    } // End function #incrementRowNumber

    moreDataRecords ()
    { this.#templateGlobalContext.consoleTrace(
        'Starting LoopBlock.moreDataRecords -> ' + this.#currentRowNumber
      );
      let localResult = false;
      // ✅ Ensure #filteredRows is an array, and #currentRowNumber is a valid number
      if ( Array.isArray(this.#filteredRows) 
           && typeof this.#currentRowNumber === 'number'
         ) 
      { localResult = ( ( this.#currentRowNumber ) < this.#filteredRows.length );
      } // End if
      else 
      { console.log('--*** Empty Cursor or invalid row number, returning FALSE');
      } // End else
      this.#templateGlobalContext.consoleTrace
      ( 'Finishing LoopBlock.moreDataRecords -> ' + localResult
      );
      return localResult;
    }  // End function moreDataRecords

    moveToNextRecord ()
    { this.#templateGlobalContext.consoleTrace
        ( 'Starting LoopBlock.moveToNextRecord -> more: ' + this.moreDataRecords() );
      if ( this.moreDataRecords() )
      { this.#incrementRowNumber() ;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.moveToNextRecord -> ' + this.#currentRowNumber );
      return this.#currentRowNumber;
    } // End function moveToNextRecord
    
    moveRecordLocation ( numberOfRecords )
    { this.#templateGlobalContext.consoleTrace
        ( 'Starting LoopBlock.moveRecordLocation -> ' 
          + numberOfRecords 
          + ',  typeof: ' 
          + typeof numberOfRecords 
        );
      let validInteger = new RegExp ( (/^[-+]?\d+$/) );
      if ( validInteger.test ( numberOfRecords ) )
      { // it is a numeric value
        this.#currentRowNumber  = parseInt ( this.#currentRowNumber, 10 );
        numberOfRecords         = parseInt ( numberOfRecords, 10 );
        this.#currentRowNumber  = this.#currentRowNumber + numberOfRecords;
        this.#currentLineNumber = Math.max ( this.#currentRowNumber, 0 );
        this.#currentLineNumber = Math.min ( this.#currentRowNumber, (this.#filteredRows.length-1) );
        this.#setRowNumber (  this.#currentRowNumber  );
        this.defineRowAttributes ( this.#currentRowNumber );
      } // End if
      else
      { 
        if ( LIST_OF_MOVE_WORDS.includes ( numberOfRecords.trim().toUpperCase() )  )
        { switch ( numberOfRecords.trim().toUpperCase() )
          { case 'TOP':
              this.#setRowNumber       ( 0 );
              this.defineRowAttributes ( 0 );
              break;
            case 'BOTTOM':
              this.#setRowNumber       ( this.#filteredRowCount -1 ); // zero based
              this.defineRowAttributes ( this.#currentRowNumber ); 
              break;
            case 'UP':
            case 'PREVIOUS':
              this.moveRecordLocation (-1);
              break;
            case 'DOWN':
            case 'NEXT':
              this.moveToNextRecord ();
              break;
          } // End switch
        } // End if
        else
        { let errorMessage = '--*** moveRecordLocation requires a numeric type, received "' + numberOfRecords + '", ignored';
          console.log ( errorMessage );
        } // End else
      } // End else
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.moveRecordLocation -> ' + this.#currentRowNumber );
      return this.#currentRowNumber;
    } // End function moveToNextRecord

    defineRowAttributes(recordNumber) 
    { this.#templateGlobalContext.consoleTrace(
        'Starting LoopBlock.defineRowAttributes -> ' + recordNumber
      );
      if (typeof recordNumber !== 'number' || isNaN(recordNumber)) 
      { recordNumber = this.getCurrentRowNumber();
      } // End if
    
      let keyCounter = -1;
      let record = this.#filteredRows[recordNumber];
      let varValue;
    
      if (typeof record === 'undefined') 
      { this.#validBlock = false;
      } // End if
      else 
      { // ✅ Handle arrays correctly (LIST scenario)
        if ( Array.isArray ( record ) ) 
        { record = { value: record.join(', ') }; // Convert array to a string
        } // End if
    
        let keys = Object.keys(record);
        for (let key of keys) 
        { keyCounter++;
          let varName = key;
          // ✅ Extract correct element from the array in JSON case
          if ( Array.isArray(record[key]) )
          { varValue = record[key][recordNumber]; // Get the specific indexed value
          } // End if
          else 
          { varValue = record[key];
          } // End else
    
          // ✅ Ensure varValue is a string before calling .replace() and .trim()
          if (typeof varValue !== 'string') 
          { varValue = String(varValue); // Convert non-string values to string
          } // End if
    
          varValue = varValue.replace(/\n/g, '').trim();
    
          let variableStack = this.#templateGlobalContext.getLocalVariableStack();
          variableStack.set(varName, varValue);
          TdlUtils.definePseudoElements(variableStack, varName, varValue);
        } // End for
      } // End else
    
      this.isFirstRow();
      this.isLastRow();
      
      this.#templateGlobalContext.consoleTrace
      ( 'Finishing LoopBlock.defineRowAttributes -> ' + keyCounter
      );
    
      return keyCounter;
    } 
    
    convertToTableFormat( rawData, dataType ) 
    { 
      this.#templateGlobalContext.consoleTrace 
        ( 'Starting convertToTableFormat -> ' + dataType );
      let structuredData = [];
      if ( dataType === 'LIST' ) 
      { structuredData = this.extractList( rawData ); 
      } // End if
      else if ( dataType === 'JSON' ) 
      { structuredData = this.extractJson( rawData ); 
      } // End if-else
    
      this.#templateGlobalContext.consoleTrace 
        ( 'Finishing convertToTableFormat -> ' + JSON.stringify(structuredData) );
    
      return structuredData;
    } // End function convertToTableFormat
    

  //===== Utilities

    exitTheLoop ()
    { this.#setRowNumber ( this.#filteredRows.length );
    } // End if

    breakTheLoop ()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.breakTheLoop ' );
      this.EndOfLoop();
      this.setValidBlock ( false );
      this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.breakTheLoop -> ' )+ this.#currentLineNumber;
      return this.#currentLineNumber+2;
    } // End function breakTheLoop

    EndOfLoop ()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.EndOfLoop ' );
      this.#currentLineNumber = this.#endLineNumber -1;
      this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.EndOfLoop -> ' )+ this.#currentLineNumber;
      return this.#currentLineNumber;
    } // End function EndOfLoop

    nextInLoop ()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.nextInLoop ' );
      this.#currentLineNumber++;
      if ( this.#currentLineNumber >= this.#endLineNumber )
      { this.#currentLineNumber = this.#beginLineNumber+1;
        this.#incrementLoopCounter ();
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.nextInLoop -> ' )+ this.#currentLineNumber;
      return this.#currentLineNumber;
    } // End function nextInLoop
  
    previousInLoop ()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.previousInLoop ' );
      this.#currentLineNumber--;
      if ( (this.#currentLineNumber-1) == this.#beginLineNumber )
      { this.#incrementLoopCounter ();
      } // End if
      if ( this.#currentLineNumber <= this.#beginLineNumber )
      { this.#currentLineNumber = this.#endLineNumber-1;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.previousInLoop -> ' )+ this.#currentLineNumber;
      return this.#currentLineNumber;
    } // End function previousInLoop
  
    topOfLoop ()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.topOfLoop -> ' + this.#currentLineNumber );
      this.#incrementLoopCounter ();
      this.#currentLineNumber = this.#beginLineNumber-1;
      this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.topOfLoop -> ' + this.#currentLineNumber );
      return this.#currentLineNumber;
    } // End function topOfLoop


  //===== Getters
    getLoopName()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getLoopName -> ' + this.#loopName );
      return this.#loopName;
    } // End function getLoopName     
    isValidBlock()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.isValidBlock -> ' + this.#validBlock);
      return this.#validBlock;
    } // End function isValidBlock
    getBeginLineNumber()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getBeginLineNumber -> ' + this.#beginLineNumber);
      return this.#beginLineNumber;
    } // End function getBeginLineNumber
    getCurrentLineNumber()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getCurrentLineNumber -> ' + this.#currentLineNumber);
      return this.#currentLineNumber;
    } // End function getCurrentLineNumber
    getCurrentStatement()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getCurrentStatement -> "' + this.#templateFile [ this.#currentLineNumber ] + '"' );
      return this.#templateFile [ this.#currentLineNumber ];
    } // End function getCurrentStatement
    getEndLineNumber()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getEndLineNumber -> ' + this.#endLineNumber);
      return this.#endLineNumber;
    } // End function getEndLineNumber
    getCursorDefinitions()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getCursorDefinitions -> ' + this.#cursor);
      return this.#cursor;
    } // End function getCursorDefinitions
    getLoopCounter()
    { this.#templateGlobalContext.consoleTrace ( 'Executing LoopBlock.getLoopCounter -> ' + this.#loopCounter);
      if ( typeof this.#loopCounter !== 'number' )
      { this.#setLoopCounter();
        this.#setRowNumber();
      } // End if
      return this.#loopCounter;
    } // End function getLoopCounter
    getOriginalTableRows()
    { return this.#originalTableRows;
    } // End getOriginalTableRows


  //===== Setters

    setLoopName ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setLoopName -> ' + newValue );
      if ( newValue )
      { this.#loopName = newValue;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setLoopName -> ' + this.#loopName );
    } // End function setLoopName     
    setValidBlock ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setValidBlock -> ' + newValue );
      if ( typeof newValue === 'boolean' )
      { this.#validBlock = newValue;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setValidBlock -> ' +  this.#validBlock );
    } // End function setValidBlock
    setBeginLineNumber ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setBeginLineNumber -> ' + newValue );
      if ( typeof newValue === 'number' )
      { this.#beginLineNumber = newValue;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setBeginLineNumber -> ' + this.#beginLineNumber );
    } // End function setBeginLineNumber
    setCurrentLineNumber ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setCurrentLineNumber -> ' + newValue );
      if ( typeof newValue === 'number' )
      { this.#currentLineNumber = newValue;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setCurrentLineNumber -> ' + this.#currentLineNumber );
    } // End function setCurrentLineNumber
    setEndLineNumber ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setCurrentLineNumber -> ' + newValue );
      if ( typeof newValue === 'number' )
      { this.#endLineNumber = newValue;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setCurrentLineNumber -> ' + this.#endLineNumber );
    } // End function setEndLineNumber

    setCursor ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setCursor -> ' + newValue );
      if ( newValue )
      { this.#cursor = newValue;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setCursor -> ' + this.#cursor );
    } // End function setCursor

    #setTemplateFile ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.setTemplateFile -> ' );
      if ( typeof newValue === 'object' )
      { this.#templateFile = newValue;
      } // End if
      this.#totalRows = this.#templateFile.length;
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.setTemplateFile -> '  + this.#templateFile.length );
    } // End function setTemplateFile

    setOriginalTableRows
      ( originalTableRows )
    { this.#originalTableRows = originalTableRows;
    } // End setOriginalTableRows

    toJSON()
    { this.#templateGlobalContext.consoleTrace ( 'Starting LoopBlock.toJSON ' );
      let jsonText =  "\n{\n"
                    + "  \"loopName\"              : \"" + this.getLoopName() + "\",\n"
                    + "  \"loopCounter\"           : \"" + this.getLoopCounter() + "\",\n"
                    + "  \"validBlock\"            : \"" + this.isValidBlock() + "\",\n"
                    + "  \"beginLineNumber\"       : \"" + this.getBeginLineNumber() + "\",\n"
                    + "  \"currentLineNumber\"     : \"" + this.getCurrentLineNumber() + "\",\n"
                    + "  \"endLineNumber\"         : \"" + this.getEndLineNumber() + "\",\n"
                    + "  \"statement\"             : \"" + this.getCurrentStatement() + "\"\n"
                    +"}\n";
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopBlock.toJSON ->\n' + jsonText );
      return jsonText;
    } // end function toJSON

} // End class LoopBlock

function unitTestLoopBlock()
{ console.log ( "--========== starting unitTestLoopBlock ==========");
  let templateGlobalContext
    = new TemplateGlobalContext
          ( "_",
            "#",
            process.cwd()
          );
  let fileIO = templateGlobalContext.getFileIO();
  let filename = "./Templates/loopExample.template";
  let fileContents = fileIO.synchronouslyReadFile ( filename );
  console.log ( "===== Step 1.0" );
  let loopName = 'testLoop';
  let currentLineNumber = 0;
  let loopBlock = new LoopBlock( loopName, currentLineNumber, fileContents, templateGlobalContext );
  loopBlock.toJSON();
  if ( loopBlock.isValidBlock() )
  { console.log ( '--+++ Yes, it is a valid loop block' );
  } // End if
  else
  { console.log ( '--*** NO, it is NOT a valid loop block' );
  } // End else
  for ( let iteration = 0; iteration < 8; iteration++ )
  { console.log ( '#### loopBlock       ->\n' + loopBlock.toJSON() );
    loopBlock.previousInLoop();
  } // end for
  let lineNumber;
  console.log ( '#### isValidBlock : ' + loopBlock.isValidBlock() );
  console.log ( '#### topOfLoop          : ' + loopBlock.top() + ' statement "' + loopBlock.getCurrentStatement()  + '"' );
  console.log ( '#### EndOfLoop    : ' + loopBlock.end() + ' statement "' + loopBlock.getCurrentStatement()  + '"' );
  console.log ( '#### reset() ' );
  loopBlock.reset();
  console.log ( '#### loopBlock       ->\n' + loopBlock.toJSON() );
  console.log ( '#### previousInLoop     : ' + loopBlock.previous() + ' statement "' + loopBlock.getCurrentStatement()  + '"' );
  console.log ( '#### breakTheLoop        : ' + (lineNumber = loopBlock.break()) + ' statement "' + fileContents[lineNumber]  + '"' );
  console.log ( '#### isValidBlock : ' + loopBlock.isValidBlock() );

  return;
} // End function unitTestLoopBlock

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestLoopBlock();
} // End if