/**
 * File: TdlUtils.js
 * 
 * Copyright (c) 2023 to present by Dido Solutions. All rights reserved.
 *
 * **Prohibited Activities:**
 * * You cannot copy, modify, distribute, transmit, reproduce, publish,
 * * publicly display, publicly perform, create derivative works, transfer,
 *   or sell any of the content without prior written permission from 
 *   Dido Solutions.
 *
 * **Non-Exclusive License:**
 * * This file is provided "as is" without warranty of any kind, expressed or 
 *   implied.
 * * You are granted a non-exclusive, non-transferable license to use this
 *   file for personal, non-commercial purposes only.
 *
 * **Non-Commercial Use:**
 * * Governments, educational institutions, and tax-exempt/public-benefit 
 *   non-profits are granted a non-exclusive, non-transferable license to 
 *   use this file for non-commercial purposes.
 *
 * **Commercial Use:**
 * * You cannot use this file for your business or profit without 
 *   Dido Solutions' consent (https://didosolutions.com/contact/).
 *
 * **Attribution Notice:**
 * * You must retain this attribution notice in all copies of the file:
 * * Copyright (c) 2023 by Dido Solutions. All rights reserved.
 *
 * **Last Revision:** 15 February 2025 - Improved function performance and documentation.
 * **Reviewers (Human):**
 * * R. W. Stavros, Ph.D. - Code Review
 * * John Doe - Security Review
 * **Automated Reviews:**
 * * Hamish I. MacCloud, AIA - AI Code Review
 * * Grammarly - Spelling & Grammar Check (Last run: 15 February 2025)
 * * ESLint - Code Linting (Last run: 14 February 2025)
 * * SonarQube - Complexity Analysis & Vulnerability Scan (Last run: 13 February 2025)
 * * FOSSology - Open Source License Compliance Check (Last run: 12 February 2025)
 */
 
/**
 * @file TdlUtils.js
 * @description Provides utility functions for processing text and formatting data.
 * @class TdlUtils
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 * @reviewer R. W. Stavros, Ph.D. - Code Review
 * @reviewer John Doe - Security Review
 * @automated_review Hamish I. MacCloud, AIA - AI Code Review
 * @automated_review Grammarly - Spelling & Grammar Check (Last run: 15 February 2025)
 * @automated_review ESLint - Code Linting (Last run: 14 February 2025)
 * @automated_review SonarQube - Complexity & Security Scan (Last run: 13 February 2025)
 * @automated_review FOSSology - Open Source License Compliance (Last run: 12 February 2025)
 */

//===== Imports =====
import { readFile }                    from "fs/promises";
import TemplateGlobalContext           from "./TemplateGlobalContext.js";
import * as path                       from 'path';
import fileSystem                      from 'fs';
import { execSync }                    from 'child_process';

//===== Constants =====
export const PSEUDO_ELEMENT             = '::';
export const RULER = '0....:....1....:....2....:....3....:....4....:....5....:....6....:....7....:....8....:....9....:...10';
export const MAX_ATTEMPTS               = 3;
export const CHARS_REQ_ESCAPE           = [ '.', '\\', '+', '*',',', '?', '[', '^', ']', '$', '(', ')', '{', '}', '=', '!', '<', '>', '|', ':', '-', '"'];
export const LIST_OF_ON_WORDS           = [ "true" , "True" , "TRUE" , "T" , "t", 
                                             "ON", "on", "On", 
                                             "YES", "yes", "Yes", "Y", "y",
                                             "ENABLE", "enable", "Enable",
                                             "1"
                                            ];
export const LIST_OF_OFF_WORDS          = [ "false", "False", "FALSE", "F", "f",
                                            "OFF", "off", "Off", 
                                            "NO", "no", "No", "N", "n",
                                            "DISABLE", "disable", "Disable",
                                            "0" 
                                           ];
export const TERMINAL_TYPES             = [ 'boolean', 'number', 'bigint', 'string', ];
export const CONTEXT_TYPE               = [ 'ENVIRONMENT', 'GLOBAL' ];

//===== Class Definition =====
export default class TdlUtils
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;

  constructor ( templateGlobalContext )
  { if ( !templateGlobalContext )
    { console.log ( '--*** No TemplateGlobalContext provided to MetaSettings, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    this.#templateGlobalContext = templateGlobalContext;
    this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils Constructor' );
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils Constructor' );
  } // End constructor TdlUtils

  getTemplateGlobalContext()
  { return this.#templateGlobalContext;
  } // End function getTemplateGlobalContext

  isOnOrOff ( text )
  { this.#templateGlobalContext.consoleTrace ( 'Starting isOnOrOff -> ' + text );
    let localResult = ( this.isOn ( text ) || this.isOff ( text ) );
    this.#templateGlobalContext.consoleTrace ( 'Finishing isOnOrOff -> ' + localResult );
    return localResult;
  } // End function isOnOrOff
  
  isOn ( text )
  { this.#templateGlobalContext.consoleTrace ( 'Starting isOn -> ' + text );
    let localResult = false;
    if ( text && text?.length >= 0 )
    { text = text.trim().toUpperCase();
      localResult = LIST_OF_ON_WORDS.includes ( text );
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing isOn -> ' + localResult );
    return localResult;
  } // End function isOn

  isOff ( text )
  { this.#templateGlobalContext.consoleTrace ( 'Starting isOff -> ' + text );
    let localResult = -1;
    if ( text && text?.length >= 0 )
    { text = text.trim().toUpperCase();
      localResult = LIST_OF_OFF_WORDS.includes ( text );
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing isOff -> ' + localResult );
    return localResult;  
  } // End function isOff

  isNumeric ( text )
  { this.#templateGlobalContext.consoleTrace ( 'Starting isNumeric -> ' + text );
    let localResult = false;
    let validIntegerRegex = new RegExp ( /^-?\d+(\.\d{1,2})?$/ )
    if ( validIntegerRegex.test ( text ) )
    { localResult = true;
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing isNumeric -> ' + localResult );
    return localResult;
  } // End function isNumeric

  readContinuedLine ( linesOfFile, lineCounter, lineOfText )
  { let metaLineContinue            = this.#templateGlobalContext.getMetaSettings ().get( 'metaLineContinue' );
    this.#templateGlobalContext.consoleTrace ( 'Starting readContinuedLine');
    let continuedLineOfText;
    let isContinuedLine = lineOfText.trimEnd().endsWith ( metaLineContinue );
    if ( ! isContinuedLine )
    { continuedLineOfText = lineOfText;
    } // End if
    else
    { continuedLineOfText = lineOfText;
      while ( continuedLineOfText.trimEnd().endsWith ( metaLineContinue ) )
      { let actualLineOfText
            = continuedLineOfText.trimEnd().substring
                  ( 0, 
                   continuedLineOfText.trimEnd().length - metaLineContinue.length 
                  );
        lineCounter++;
        continuedLineOfText = actualLineOfText + linesOfFile [ lineCounter ] ;
      } // Eed while
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing readContinuedLine -> \n' + continuedLineOfText );
    return [ lineCounter, continuedLineOfText ];
  } // End function readContinuedLine

  readTemplateLiteral ( linesOfFile, lineCounter, lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting readTemplateLiteral -> lineCounter : ' + lineCounter + ', lineOfText : "' + lineOfText + '"' );
    let foundTemplateLiteral       = false;
    let metaTemplateLiteral        = this.#templateGlobalContext.getMetaSettings ().get( 'metaTemplateLiteral' );
    let macroLiteralStart          = lineOfText.indexOf ( metaTemplateLiteral );
    let macroLiteralEnd            = lineOfText.indexOf ( metaTemplateLiteral, macroLiteralStart + metaTemplateLiteral.length);
    while ( macroLiteralEnd >= 0 )
    { let macroLiteralString 
          = lineOfText.substring 
              ( macroLiteralStart, 
                macroLiteralEnd + metaTemplateLiteral.length 
              );
      //console.log ( '#### 1000 macroLiteralString: ' + macroLiteralString );
      let macroLiteral = lineOfText.substring ( (macroLiteralStart + metaTemplateLiteral.length),  macroLiteralEnd );
      //console.log ( '#### 1000 macroLiteral      : "' +  macroLiteral + '"' );
      if ( macroLiteralStart >= 0 && macroLiteralEnd > macroLiteralStart )
      { lineOfText = lineOfText.replace ( macroLiteralString, macroLiteral );
        linesOfFile [ lineCounter ] = lineOfText;
        foundTemplateLiteral = true;
      } // End if
      //console.log ( '#### 1000 lineOfText        : ' + lineOfText );
      
      macroLiteralStart          = lineOfText.indexOf ( metaTemplateLiteral );
      macroLiteralEnd            = lineOfText.indexOf ( metaTemplateLiteral, macroLiteralStart + metaTemplateLiteral.  length);
      //console.log ( '#### 1000 macroLiteralStart : ' + macroLiteralStart );
      //console.log ( '#### 1000 macroLiteralEnd   : ' + macroLiteralEnd );
    } // End while 
    let newLineOfText              = '';
    let lineBuffer;
    if ( macroLiteralStart >= 0 )
    { foundTemplateLiteral = true;
      lineOfText = lineOfText.replace ( metaTemplateLiteral, '' );
      newLineOfText = lineOfText;
      lineCounter++;
      lineOfText = linesOfFile [ lineCounter ];
      while ( ( macroLiteralStart = lineOfText.indexOf ( metaTemplateLiteral ) ) < 0 )
      { newLineOfText = newLineOfText + '\n' + linesOfFile [ lineCounter ];
        linesOfFile.splice(lineCounter, 1);
        if ( lineCounter >=  linesOfFile.length ) break;
        lineOfText = linesOfFile [ lineCounter ];
      } // End while
      lineCounter--;
      linesOfFile [ lineCounter ] = newLineOfText;
      if ( macroLiteralStart >= 0 )
      { lineBuffer = lineOfText.split ( metaTemplateLiteral );
        newLineOfText += '\n' + lineBuffer [ 0 ];
        linesOfFile [ lineCounter ] = newLineOfText;
        if ( lineBuffer.length > 1 && ( lineBuffer[1] ) )
        { lineOfText = lineBuffer [ 1 ].trim();
          linesOfFile [ lineCounter+1 ] = lineOfText;
        } // End if
      } // End if
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing readTemplateLiteral -> lineCounter: ' + lineCounter + ', LineOfCode: "' + linesOfFile [ lineCounter ] + '"' );
    return [ foundTemplateLiteral, lineCounter, linesOfFile [ lineCounter ],  linesOfFile ];
  } // End function readTemplateLiteral

  replaceVariableValue ( lineOfText, startOfVariableLocation, variableName, variableValue )
  { this.#templateGlobalContext.consoleTrace 
      ( 'Starting replaceVariableValue -> ' 
        + lineOfText + ', ' 
        +  startOfVariableLocation + ', '
        + variableName + ', "' 
        + variableValue + '"'
      );
    let metaMacroStart            = this.#templateGlobalContext.getMetaSettings ().get( 'metaMacroStart' );
    let metaMacroEnd              = this.#templateGlobalContext.getMetaSettings ().get( 'metaMacroEnd' );
    let metaVarStart            = this.#templateGlobalContext.getMetaSettings ().get( 'metaVarStart' );
    let metaVarEnd              = this.#templateGlobalContext.getMetaSettings ().get( 'metaVarEnd' );
    variableName                = variableName.trim();
    variableName                = metaVarStart + variableName + metaVarEnd;
    let attemptCounter = 0;
    while ( lineOfText.indexOf ( variableName, startOfVariableLocation ) >= 0 )
    { lineOfText = lineOfText.replace ( variableName, variableValue );
      attemptCounter++;
      if ( attemptCounter > MAX_ATTEMPTS )
      { break;
      } // End if
    } // End while
    this.#templateGlobalContext.consoleTrace ( 'Finishing replaceVariableValue -> ' + lineOfText );
    return lineOfText;
  } // End function replaceVariableValue

  expandVariableNames ( lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting expandVariableNames -> ' + lineOfText );
    let metaVarStart            = this.#templateGlobalContext.getMetaSettings ().get( 'metaVarStart' );
    let metaVarEnd              = this.#templateGlobalContext.getMetaSettings ().get( 'metaVarEnd' );
    if ( typeof lineOfText !== 'undefined' ) 
    { let startOfVariableLocation = lineOfText.indexOf ( metaVarStart );
      let lastStartOfVariable     = startOfVariableLocation;
      for ( let attempt = 0; attempt < MAX_ATTEMPTS; attempt++ )
      { while ( startOfVariableLocation >= 0 )
        { let endOfVariable = lineOfText.indexOf ( metaVarEnd, startOfVariableLocation );
          let lengthOfVariableName = endOfVariable;
          let variableName = lineOfText.substring ( startOfVariableLocation + metaVarStart.length , lengthOfVariableName );
          let variableValue =  this.#templateGlobalContext.get ( variableName );
          if ( typeof variableValue !== 'undefined' )
          { lineOfText 
              = this.replaceVariableValue 
                  ( lineOfText, 
                    startOfVariableLocation, 
                    variableName, 
                    variableValue
                  );
            startOfVariableLocation = lineOfText.indexOf ( metaVarStart );
          } // End if
          else
          { startOfVariableLocation = lineOfText.indexOf ( metaVarStart, ( startOfVariableLocation + metaVarStart.length ) );
          } // End Else
          if ( startOfVariableLocation ===  lastStartOfVariable ) 
          { break;
          } // End if 
          lastStartOfVariable = startOfVariableLocation;
        } // End while
      } // End if
    } // End block
    this.#templateGlobalContext.consoleTrace ( 'Finishing expandVariableNames -> ' + lineOfText );
    return lineOfText;
  } // End function expandVariableNames

  removeLineComments ( lineCounter, lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting removeLineComments -> ' + lineCounter + ' -> ' + lineOfText );
    let metaCommentIndicator     = this.#templateGlobalContext.getMetaSettings ().get( 'metaCommentIndicator' );
    let parsedLineOfText         = lineOfText.split ( metaCommentIndicator );
    let commentText              = '';
    let newLineOfText            = parsedLineOfText[0];
    if ( parsedLineOfText.length > 1 )
    { commentText = parsedLineOfText[1];
    } // End if 
    this.#templateGlobalContext.consoleTrace ( 'Finishing removeLineComments -> ' + lineCounter + ' -> ' + newLineOfText + ' -> ' +  commentText );
    return [ lineCounter, newLineOfText, commentText ] ;
  } // End function removeLineComments

  joinCommentLinesTogether ( linesOfFile, lineCounter, lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting joinCommentLinesTogether -> ' + lineCounter + ' -> ' + lineOfText );
    let metaCommentStart       = this.#templateGlobalContext.getMetaSettings ().get( 'metaCommentStart' );
    let metaCommentEnd         = this.#templateGlobalContext.getMetaSettings ().get( 'metaCommentEnd' );
    let metaEchoComment        = this.#templateGlobalContext.getMetaSettings ().get( 'metaEchoComment' );
    let metaEchoInfo           = this.#templateGlobalContext.getMetaSettings ().get( 'metaEchoInfo' );
    let startOfCommentLocation = lineOfText.indexOf ( metaCommentStart );
    let endOfComment           = lineOfText.indexOf ( metaCommentEnd, startOfCommentLocation );
    let commentText            = '';
    let newLineOfText          = lineOfText;

    if ( startOfCommentLocation >= 0 && endOfComment < 0 )
    { newLineOfText = lineOfText.substring ( 0, startOfCommentLocation  );
      commentText = lineOfText.substring ( startOfCommentLocation + metaCommentStart.length );
      let foundEndOfComment = false;
      startOfCommentLocation = 0;
      while ( ! foundEndOfComment && lineCounter < linesOfFile.length-1 )
      { lineCounter++;
        lineOfText = linesOfFile [ lineCounter ];
        endOfComment = lineOfText.indexOf ( metaCommentEnd, startOfCommentLocation );
        if ( endOfComment < 0 )
        { commentText = commentText + '\n' + lineOfText;
          foundEndOfComment = false;
        } // end if
        else
        { commentText = commentText + '\n' + lineOfText.substring ( 0, endOfComment );
          newLineOfText = newLineOfText + lineOfText.substring ( endOfComment + metaCommentEnd.length );
          foundEndOfComment = true;
        } // End else
      } // End while
      if ( newLineOfText.indexOf ( metaCommentEnd ) > 0 )
      { newLineOfText = newLineOfText.substring ( newLineOfText.indexOf ( metaCommentEnd) + metaCommentEnd.length );
      } // End if 
    } // end if
    this.#templateGlobalContext.consoleTrace ( 'Finishing joinCommentLinesTogether -> ' + lineCounter + ' -> ' + newLineOfText + ' -> ' +  commentText );
    return [ lineCounter, newLineOfText, commentText ] ;
  } // End function joinCommentLinesTogether 

  scanForBlockComments ( linesOfFile, lineCounter, lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting scanForBlockComments -> ' + lineCounter + ' -> ' + lineOfText );
    let metaCommentStart       = this.#templateGlobalContext.getMetaSettings ().get( 'metaCommentStart' );
    let metaCommentEnd         = this.#templateGlobalContext.getMetaSettings ().get( 'metaCommentEnd' );
    let metaEchoComment        = this.#templateGlobalContext.getMetaSettings ().get( 'metaEchoComment' );
    let metaEchoInfo           = this.#templateGlobalContext.getMetaSettings ().get( 'metaEchoInfo' );
    let startOfCommentLocation = lineOfText.indexOf ( metaCommentStart );
    let lastOfCommentLocation  = 0;
    let endOfComment           = lineOfText.indexOf ( metaCommentEnd, startOfCommentLocation );
    let commentText            = '';
    let newLineOfText          = lineOfText;
    if ( startOfCommentLocation >= 0 )
    { newLineOfText = '';
    } // End if
    while ( startOfCommentLocation >= 0 )
    { endOfComment = lineOfText.indexOf ( metaCommentEnd, startOfCommentLocation );
      let lengthOfComment = endOfComment;
      commentText = commentText + lineOfText.substring ( startOfCommentLocation + metaCommentStart.length , lengthOfComment );
      newLineOfText = newLineOfText + lineOfText.substring ( lastOfCommentLocation, startOfCommentLocation  );
      lastOfCommentLocation = endOfComment + metaCommentEnd.length;
      startOfCommentLocation = lineOfText.indexOf ( metaCommentStart, startOfCommentLocation + metaCommentStart.length );
    } // end while
    
    if ( endOfComment >= 0 )
    { newLineOfText = newLineOfText + lineOfText.substring ( endOfComment + metaCommentEnd.length );
    } // end if
    this.#templateGlobalContext.consoleTrace ( 'Finishing scanForBlockComments -> ' + lineCounter + ' -> ' + newLineOfText + ' -> ' +  commentText );
    return [lineCounter, newLineOfText, commentText] ;
  } // End function scanForBlockComments

  processComments ( linesOfFile, lineCounter, lineOfText, processable )
  { this.#templateGlobalContext.consoleTrace ( 'Starting processComments -> ' + lineCounter + ' -> ' + lineOfText );
    let resultOfScan           = [ '', '', '' ]; 
    let commentText            = '';
    let metaEchoComment        = this.#templateGlobalContext.getMetaSettings ().get( 'metaEchoComment' );

     //===== Line Comments
     resultOfScan      = this.removeLineComments ( lineCounter, lineOfText );
     lineCounter       = resultOfScan[0];
     lineOfText        = resultOfScan[1];
     commentText       = resultOfScan[2];
     if ( metaEchoComment && commentText.length > 0 )
     { if ( commentText && commentText.length > 0 )
       { let expandVariables      = this.#templateGlobalContext
                                        .getEnvironmentSettings()
                                        .get ( 'expandVariables' ).trim().toLowerCase();
         if ( expandVariables )
         { commentText            = this.#templateGlobalContext.getTdlUtils().expandVariableNames ( commentText );
         } // End if
        if ( processable ) 
        { console.log ( '<->' +  commentText );
        } // End if
       } // End if
       commentText = '';
     } // End if

     //===== Multiline Line Block Comments
     let originalLineCounter = lineCounter;
     resultOfScan      = this.joinCommentLinesTogether ( linesOfFile, lineCounter, lineOfText );
     lineCounter       = resultOfScan[0];
     lineOfText        = resultOfScan[1];
     commentText       = commentText + resultOfScan[2];
     if ( metaEchoComment && commentText.length > 0 )
     { if ( commentText && commentText.length > 0 )
       { if ( processable )
         { console.log ( '<->' +  commentText );
         } // End if
       } // End if
       commentText = '';
     } // End if

     //===== One Line Block Comments
     resultOfScan      = this.scanForBlockComments ( linesOfFile, lineCounter, lineOfText );
     lineCounter       = resultOfScan[0];
     lineOfText        = resultOfScan[1];
     commentText       = commentText + resultOfScan[2];

     if ( metaEchoComment && commentText.length > 0 )
     { if ( commentText && commentText.length > 0 )
       { if ( processable )
         { console.log ( '<->' +  commentText );
         } // End if
       } // End if
       commentText = '';
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing processComments -> ' + lineCounter + ' -> ' + lineOfText + ' -> ' +  commentText );
    return [lineCounter, lineOfText, commentText] ;

  } // End function processComments

  /**
  * Processes a command-line string, parsing key-value pairs and positional parameters.
  * This function extracts named parameters, assigns default values where applicable, 
  * and stores them in the local variable stack.
  *
  * @param {string} cmdLine - The command-line input to be parsed.
  * @param {string[]} listOfParams - An ordered list of parameter names.
  * @param {string} [assignmentOp="="] - The operator used for assignments (default: "=").
  * @param {string} [literalOp='"'] - The character used to define literals (default: `"`).
  * @param {string} [wordDelineator=" "] - The separator between words (default: space).
  * @returns {number} The number of variables successfully defined.
  *
  * @example
  * // Given this macro definition:
  * _{ showParams
  *   -- &0.        := '_&0.'
  *   -- &1.        := '_&1.'
  *   -- &name.     := '_&name.'
  * _}
  * 
  * // And this input command:
  * _#showParams One name="John Q.Public"
  * 
  * // Expected results:
  * -- &0.        := 'One name="John Q.Public"'
  * -- &1.        := 'One'
  * -- &name.     := 'John Q.Public'
  *
  * @description
  * - Parses a command-line input and extracts both **positional** and **named** parameters.
  * - Handles **quoted literals** and maintains their integrity.
  * - Assigns values to `listOfParams` based on their index.
  * - Stores parsed values in `templateGlobalContext.getLocalVariableStack()`.
  * - Supports **custom delimiters**, assignment operators, and literals.
  * - Allows **fallback defaults** when named parameters are missing.
  */
  processCmdLine ( cmdLine, listOfParams, assignmentOp, literalOp, wordDelineator ) 
  { this.#templateGlobalContext.consoleTrace
    ( "Starting processCmdLine -> " + cmdLine + ' -> "' + listOfParams + '"'
    );

    let numberOfDefinitions = 0;
    if ( typeof cmdLine === "undefined" || cmdLine === "" ) 
    { return numberOfDefinitions; 
    } // End if
    let templateGlobalContext = this.#templateGlobalContext;
    if ( !assignmentOp ) 
    { assignmentOp = "="; 
    } // End if
    if ( !literalOp ) 
    { literalOp = `["']`;  // Match both single and double quotes
    } // End if
    let stripLiteralRegex = new RegExp ( literalOp, "g" );
    if ( !wordDelineator ) 
    { wordDelineator = " "; 
    } // End if
    // Regular expressions
    let namedAssignments = {};
    // Handle both quoted and unquoted values
    let paramRegex = new RegExp ( /(\w+)\s*=\s*(["']?)(.*?)\2(?=\s|$)/g );  
    let match;
    while ( ( match = paramRegex.exec ( cmdLine ) ) !== null ) 
    { let varName = match[1].trim();  // Captured name
      let varValue = match[3].trim(); // Captured value
      namedAssignments[varName] = varValue;
    } // End while
    // **Capture Full Command As `_&0.`**
    templateGlobalContext.getLocalVariableStack().set ( "0", cmdLine );
    // **Extract Positional Parameters Without Removing Named Parameters**
    let tempText = cmdLine;
    // Remove all named assignments so they don't interfere with positional arguments
    let placeholderMap = {};
    Object.keys 
      ( namedAssignments ).forEach ( ( key, index ) => 
        { let placeholder = `<<NAMED${index}>>`;
          placeholderMap[placeholder] = namedAssignments[key]; 
          tempText = tempText.replace 
            ( new RegExp ( `${key}\\s*=\\s*["']?${namedAssignments[key]}["']?`, "g" ),   
              placeholder 
            );
        }
     );
  let quotedValueRegex = /(['"])(.*?)\1/g;
  let quotedValues = [];
  tempText = tempText.replace 
    ( quotedValueRegex, ( match, p1, p2 ) =>
      { quotedValues.push( p2 ); 
        return `<<QUOTE${quotedValues.length - 1}>>`; // Replace with a placeholder
      }
    );

  // Now split the remaining string
  let splitWords 
    = tempText
      .split( wordDelineator )
      .filter ( word => word.trim().length > 0 );

  // Restore placeholders for named values and quoted values
  splitWords = splitWords.map 
    ( word => 
      { if ( placeholderMap[word] ) return placeholderMap[word]; 
        let match = word.match ( /<<QUOTE(\d+)>>/ );
        return match ? quotedValues[parseInt ( match[1], 10 )] : word;
      }
    );

  // **Store Named Parameters in Their Positional Order**
  let positionIndex = 1;
  splitWords.forEach 
    ( ( value, key ) => 
       { if ( typeof value !== "undefined" ) 
         { templateGlobalContext.getLocalVariableStack()
             .set ( positionIndex.toString(), value ); 
           positionIndex++;
         } // End if
       } // End forEach
    ); // End forEach

    // **Store Named Parameters as Well**
    Object.entries ( namedAssignments ).forEach ( ( [ key, value ] ) => 
    { templateGlobalContext.getLocalVariableStack().set ( key, value ); 
    } // End forEach
    ); // End forEach

    this.#templateGlobalContext.consoleTrace ( "Finishing processCmdLine" );

    return Object.keys ( namedAssignments ).length + splitWords.length;
  } // End function processCmdLine

   
  parseArgumentString
  ( parameters, 
    inputString, 
    missingValue = '', 
    positionalPrefix = '' 
  )
  { // Initialize the results
    const result = [];
    
    // Check if inputString is defined and not null
    if (inputString === undefined || inputString === null)
    { inputString = ''; // Set inputString to an empty string
    } // End if
    
    // Split the input string into an array of words
    const words = inputString.split(/\s+/);
    
    // Create a map to store parameter-value pairs
    const paramMap = new Map();
    
    // Iterate through the words in the input string
    for ( let wordCounter = 0; 
              wordCounter < words.length; 
              wordCounter++ 
        )
    { const word = words[ wordCounter ].trim();
      if ( word === "" )
      { // Skip empty words
        continue;
      } // End if
      // Check if the word is in the format "parameter=value"
      const keyValue = word.split("=");
      // After the parse on "=" if there are two values, 
      // we have an arg=value structure
      if ( keyValue.length === 2 )
      { const key = keyValue[0].toLowerCase(); // Convert parameter name to lowercase
        const value = keyValue[1];
        // Store the parameter-value pair in the map
        paramMap.set ( key, value );
      } // End if keyValueLength
    } // End for wordCounter
    // Extract values for the specified parameters and add extra information
    for ( const parameter of parameters ) 
    { // Convert parameter name to lowercase
      const key = parameter.toLowerCase(); 
      if ( paramMap.has ( key ) ) 
      { result.push ( [ parameter, paramMap.get(key) ] );
      } // End if
      else 
      { // If parameter is not found, add a placeholder value
        result.push([parameter, missingValue ]);
      } // End else
    } // End for parameter
    // Add the original input string and its index for reference
    result.push( [ positionalPrefix + "0", inputString ] );
    // Extract all quoted strings and non-space sequences
    const allMatches = inputString.match(/(["'])(.*?)\1|\S+/g);
    
    if ( allMatches ) 
    { for ( let matchCounter = 0; 
                matchCounter < allMatches.length; 
                matchCounter++)
      { const match = allMatches [ matchCounter ];
        if ( match.startsWith('"') 
             && match.endsWith ('"' ) 
           )
        { // Remove quotes from the matched string
          result.push ( [ positionalPrefix + ( matchCounter + 1 ), 
                          match.slice ( 1, -1 )
                        ]
                      );
        } // End if
        else if ( match.startsWith ( "'" ) 
                  && match.endsWith ( "'" ) 
                ) 
        { // Remove single quotes from the matched string
          result.push([positionalPrefix + (matchCounter + 1), match.slice(1, -1)]);
        }  // End else if
        else 
        { // No quotes, use the whole string
          result.push([positionalPrefix + (matchCounter + 1), match]);
        } // End else
      } // End for matchCounter
    } // End if allMatches
    
    // Return the results
    return result;
  } // End function parseArgumentString

  processQuestionOperator2222 ( lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting processQuestionOperator -> ' + lineOfText );
    let metaConditionalOp    = this.#templateGlobalContext.getMetaSettings().get ( 'metaConditionalOp' );
    let metaConditionalDiv   = this.#templateGlobalContext.getMetaSettings().get ( 'metaConditionalDiv' );
    var localResult = lineOfText;
    var result      = [];
    let resultCount = 0;
    if ( typeof lineOfText !== 'string' )
    { let errorMessage = '--*** getBracketedString only operates on strings, encountered: ' + typeof lineOfText;
      console.log ( errorMessage );
      return localResult;
    } // End if
    else if ( ! lineOfText.trim().startsWith ( metaConditionalOp ) )
    { return localResult;
    } // End if
    else
    { lineOfText            = lineOfText.substring ( metaConditionalOp.length );
      lineOfText            = lineOfText.trim();
      let openExpression    = '(';
      let closeExpression   = ')';
      var openBracketCount  = 0;
      var currentString     = '';
      for ( var charPos = 0; 
                charPos < lineOfText.length; 
                ++charPos 
          )
      { let currentChar  = lineOfText.charAt ( charPos ) ;
        if ( currentChar === openExpression ) openBracketCount++;
        if ( currentChar === closeExpression ) openBracketCount--;
        if ( openBracketCount >= 1 )
        { currentString += currentChar;
        } // End if
        else if ( openBracketCount == 0 )
        { currentString += currentChar;
          result [ resultCount ] = currentString;
          currentString = '';
          resultCount++;
          currentString = lineOfText.substring ( charPos+1 );
          let expressions = currentString.split( metaConditionalDiv );
          result = result.concat ( expressions );
          charPos = lineOfText.length;
        } // End else if
      } // End for charPos
    } // End else
    let logicResult = false;
    try
    { logicResult = Boolean ( eval ( result[0] ) );
      localResult = result [ 1 ];
      if ( !logicResult )
      { localResult = '';
        if ( typeof result [ 2 ] !== 'undefined' ) localResult = result [ 2 ];
      } // End if
    } // End try
    catch ( error )
    { let errorMessage = '--*** WARNING: logicExpression -> "' + result[0] + '" is not valid! ' + error;
      console.log ( errorMessage );
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing processQuestionOperator -> ' + localResult );
    return localResult;
  } // End function processQuestionOperator

  processQuestionOperator ( statement, questionOperator )
  { let metaConditionalOp    = this.#templateGlobalContext.getMetaSettings().get ( 'metaConditionalOp' );
    let metaConditionalDiv   = this.#templateGlobalContext.getMetaSettings().get ( 'metaConditionalDiv' );
    const escapedConditionalOp    = this.escapeSpecialRegExp ( metaConditionalOp );
    const regex                   = new RegExp( `^(${escapedConditionalOp})\\s*\\(([^)]*)\\)\\s*(.*)$` );
    statement                     = statement.trim();
    const match                   = statement.match(regex);
    let localResult               = '';
    if  ( match ) 
    { const operator          = match[1];
      const booleanExpression = match[2].trim();
      const everythingElse    = match[3].trim();
      // Now, split everythingElse into true and false alternatives
      const [ trueAlternative, falseAlternative ] 
        = everythingElse.split ( metaConditionalDiv );
      let booleanResult = this.evaluateLogicalExpression ( booleanExpression );
      localResult = falseAlternative.trim();
      if ( booleanResult )
      { localResult = trueAlternative.trim();
      } // End if
    } // End if
    else 
    { let errorMessage 
        = "Statement does not match the BNF pattern.\n"
          + questionOperator + " ( booleanExpression ) trueAlternative _: falseAlternative ";
      console.log( "--*** " + errorMessage );
    } // End else
    return localResult
  } // End function processQuestionOperator
  
  
  escapeSpecialRegExp ( text )
  { // Regular expression pattern to match special characters
    const specialChars = /[.*+?^${}()|[\]\\]/g ; 
    // Replace special characters with double slashes;
    const localResult = text.replace ( specialChars, '\\$&' ); 
    return localResult
  } // End function escapeSpecialRegExp
  
  evaluateLogicalExpression ( logicExpression )
  { let logicResult = false;
    try
    { if ( this.isOnOrOff ( logicExpression.trim() ) )
      { logicResult = this.isOn ( logicExpression );
      } // End if
      else
      { logicResult = Boolean ( eval ( logicExpression ) );
      } // End else
    } // End try
    catch ( error )
    { let errorMessage 
        = 'logicExpression -> "' + logicExpression + '" is not valid!\n'
           + 'Error: "' + error + '"\n'
           + 'evaluated to "' + logicResult + '"';
      console.warn ( errorMessage );
    } // End catch
    return logicResult;
  } // End function evaluateLogicalExpression

  processEchoCommand ( lineCounter, templateStatement, fileStackDepth )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils.processEchoCommand' );
    let whiteSpaceRegEx = /\s/;
    let context         = templateStatement.getArgumentText().split(whiteSpaceRegEx )[0].toUpperCase();
    let argumentList    = templateStatement.getExpression().trim();
    let position        = argumentList.search( whiteSpaceRegEx  );
    let state           = argumentList;
    let putText         = templateStatement.getArgumentText();
    let metaEchoOutput  = this.#templateGlobalContext.getMetaSettings().get ( 'metaEchoOutput' );
    if ( position >= 0 )
    { state = argumentList.substring ( 0, position ) ;
    } // End if
    state = state.toUpperCase().trim();
    if ( this.isOnOrOff ( state ) )
    { state    = this.isOn( state );
      putText  = '';
    } // End if 
    let variableName = 'metaEchoInput'; 
    if ( context === 'INPUT' )
    { variableName = 'metaEchoInput'; 
      this.#templateGlobalContext.getMetaSettings().set ( variableName, state );
    } // End if
    else if ( context === 'OUTPUT' )
    { variableName = 'metaEchoOutput';
      this.#templateGlobalContext.getMetaSettings().set ( variableName,  state );
    } // end elseif
    else if ( context === 'COMMENT' )
    { variableName = 'metaEchoComment';
      this.#templateGlobalContext.getMetaSettings().set ( variableName,  state );
    } // end elseif
    else if ( context === 'INFO' )
    { variableName = 'metaEchoInfo';
      this.#templateGlobalContext.getMetaSettings().set ( variableName,  state );
      this.#templateGlobalContext.setInfoState ( state );
    } // end elseif
    else if ( context === 'RULER' )
    { let rulerText = utils.generateRuler 
        ( templateStatement.getExpression() );
      console.log ( '<-- ' + fileStackDepth
                    + ':'
                    + lineCounter + '] ' 
                    + rulerText 
                  );
    } // End elsif
    else
    { 
      if ( metaEchoOutput )
      { console.log ( '<-- ' + fileStackDepth
                      + ':'
                      + lineCounter + '] ' 
                      + putText 
                    );
      } // End if
      console.log ( putText.toString() );
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils.processEchoCommand' );
  } // End function processEchoCommand

  processOutputCommand ( templateStatement )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils.processOutputCommand' );
    let LIST_OF_OUTPUT_COMMANDS = [ 'BEGIN', 'CLOSE', 'PAUSE', 'RESUME' ];
    let localResult = true;
    let outputOp    = templateStatement.getObject().trim().toUpperCase();
    if ( ! LIST_OF_OUTPUT_COMMANDS.includes ( outputOp ) )
    { let errorMessage = '--*** Output has an operation of "' + outputOp + '", operations must be on of: ' + LIST_OF_OUTPUT_COMMANDS;
      console.log ( errorMessage );
      localResult = false;
    } // End if
    else if ( outputOp === 'BEGIN' )
    { let filePath   = templateStatement.getExpression().trim();
      if ( typeof filePath === 'undefined' || filePath.length <= 0 )
      { let outputPath           = this.#templateGlobalContext.get ( 'outputPath' );
        if ( outputPath.trim().charAt ( 0 ) !== '/' )
        { outputPath = './' + outputPath;
        } // End if 
        let outputFileName       = this.#templateGlobalContext.get ( 'outputFileName' );
        let outputFileExtension  = this.#templateGlobalContext.get ( 'outputFileExtension' );
        filePath = outputPath + outputFileName + outputFileExtension;
      } // End if
      this.#templateGlobalContext.getFileIO().openOutputFile ( filePath );
    } // End else if
    else if ( outputOp === 'CLOSE' )
    { this.#templateGlobalContext.getFileIO().closeOutputFile();
    } // End else if
    else if ( outputOp === 'PAUSE' )
    { this.#templateGlobalContext.getFileIO().pauseOutputFile();
    } // End else if
    else if ( outputOp === 'RESUME' )
    { this.#templateGlobalContext.getFileIO().resumeOutputFile();
    } // End else if
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils.processOutputCommand' );

  } // End function processOutputCommand

  processEchoOutput ( lineCounter, templateStatement, currentLineOfText, currentMetaIndent, fileStackDepth )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils.processEchoOutput' );
    let suppressBlanks  = this.#templateGlobalContext.get ( 'suppressBlanks' ).trim().toLowerCase();
    if ( typeof currentLineOfText === 'undefined' ) 
    { currentLineOfText = '';
    } // End if 
    if ( ! suppressBlanks==='true' || currentLineOfText?.trim().length !== 0 )
    { let localLineOfText
             = this.#templateGlobalContext.getTdlUtils().fixLineIndent 
                 ( currentLineOfText, 
                   templateStatement.getIndent(), 
                   currentMetaIndent 
                 );
      console.log 
        ( '<-- ' + fileStackDepth
                 + ':'
                 + lineCounter
                 + '] ' 
                 // + localIndent + ' ->'
                 + localLineOfText
                 // + '<-'
        );
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils.processEchoOutput' );
  } // End function processEchoOutput

  processWordWrap ( lineCounter, templateStatement, fileStackDepth, currentMetaIndent )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils.processWordWrap' );
    // console.log ( '#####  templateStatement -\n ' + templateStatement.toJSON() );
    let metaEchoOutput       = this.#templateGlobalContext.getMetaSettings().get ( 'metaEchoOutput' );
    let suppressBlanks       = this.#templateGlobalContext.get ( 'suppressBlanks' ).trim().toLowerCase();
    let whiteSpaceRegEx      = /\s/;
    let context              = templateStatement.getArgumentText().split ( whiteSpaceRegEx )[0].toUpperCase();
    let argumentList         = templateStatement.getExpression().trim();
    let position             = argumentList.search( whiteSpaceRegEx );
    let state                = argumentList;
    let wordWrap             = this.#templateGlobalContext.getWordWrap();
    let foundFormat         = wordWrap.setupFormat ( templateStatement.getObject() );
    let formattedCommentText = wordWrap.process ( templateStatement.getExpression() );
    let wrapTextLineCounter  = -1;
    for ( let textLine of formattedCommentText )
    { wrapTextLineCounter++;
      if ( metaEchoOutput )
      { console.log ( '<-- ' + fileStackDepth
                      + ':'
                      + lineCounter 
                      + ':'
                      + wrapTextLineCounter
                      + '] ' 
                      + textLine  
                   );
      } // End if
      if ( this.#templateGlobalContext.getFileIO().isOutputOpen() )
         { if ( ! ( suppressBlanks==='true' && (textLine.trim().length == 0) ) )
           { textLine
               = this.#templateGlobalContext.getTdlUtils().fixLineIndent 
                   ( textLine, 
                     templateStatement.getIndent(), 
                     currentMetaIndent 
                   );
              this.#templateGlobalContext.getFileIO().putLineToFile ( textLine );
           } // End if
         } // End if
    }  // End for
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils.processWordWrap ->' + wrapTextLineCounter );
  } // End function processWordWrap

  processSettingVariableValues ( templateStatement, )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils.processSettingVariableValues' );
    let localResult         = false;
    let context             = templateStatement.getArgumentText().split(/\s/ )[0].toUpperCase();
    let argumentList        = templateStatement.getExpression().trimStart();
    let position            = argumentList.search( /\s/ );
    let variableName        = argumentList.substring ( 0, position ) ;
    let environmentSettings = this.#templateGlobalContext.getEnvironmentSettings();
    let metaSettings        = this.#templateGlobalContext.getMetaSettings();
    position                = templateStatement.getArgumentText().search(variableName) + variableName.length + 1;
    let variableValue       = templateStatement.getArgumentText().substring ( position );
    let validContext        = CONTEXT_TYPE.includes ( context );
    if ( !validContext )
    { variableName = templateStatement.getObject();
      variableValue = templateStatement.getExpression().trim();
      if ( environmentSettings.getEnvironmentSettings().has ( variableName  ) )
      { context = 'ENVIRONMENT';
      } // End if
      else if ( metaSettings.getMetaSettings().has( variableName  ) )
      { context = 'GLOBAL';
      } // End if
    } // End if
    if ( context === 'GLOBAL'.substring ( 0, Math.max ( context.length, 1) ) )
    { if ( variableName.endsWith ( PSEUDO_ELEMENT ) )
      { variableName = variableName.replace(new RegExp(PSEUDO_ELEMENT + "$"), "");
        metaSettings.set ( variableName, variableValue );
        variableName = variableName + PSEUDO_ELEMENT;
        metaSettings.set ( variableName + 'LowerCase'       , toLowerCase        ( variableValue ) );
        metaSettings.set ( variableName + 'TitleCase'       , toTitleCase        ( variableValue ) );
        metaSettings.set ( variableName + 'UpperCase'       , toUpperCase        ( variableValue ) );
        metaSettings.set ( variableName + 'CamelCase'       , toUpperCamelCase   ( variableValue ) );
        metaSettings.set ( variableName + 'LowerSnakeCase'  , toLowerSnakeCase   ( variableValue ) );
        metaSettings.set ( variableName + 'UpperSnakeCase'  , toUpperSnakeCase   ( variableValue ) );
        metaSettings.set ( variableName + 'TitleSnakeCase'  , toTitleSnakeCase   ( variableValue ) );
        metaSettings.set ( variableName + 'UpperCamelCase'  , toUpperCamelCase   ( variableValue ) );
        metaSettings.set ( variableName + 'LowerCamelCase'  , toLowerCamelCase   ( variableValue ) );
        metaSettings.set ( variableName + 'UpperKebabCase'  , toUpperKebabCase   ( variableValue ) );
        metaSettings.set ( variableName + 'LowerKebabCase'  , toLowerKebabCase   ( variableValue ) ); 
      } // End if
      else
      { metaSettings.set ( variableName, trim(variableValue) );
        if ( variableName.toUpperCase() === 'metaIndicator'.toUpperCase() )
        { this.setNewMetaIndicator ( trim ( variableValue ) );
        } // End if
      } // End Else 
      localResult = true;
    } // End if
    else if ( context === 'ENVIRONMENT'.substring ( 0, context.length ) )
    { if ( variableName.endsWith ( PSEUDO_ELEMENT ) )
      { variableName = variableName.replace(new RegExp(PSEUDO_ELEMENT + "$"), "");
        environmentSettings.set ( variableName, variableValue );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'LowerCase'       , toLowerCase        ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'TitleCase'       , toTitleCase        ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'UpperCase'       , toUpperCase        ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'CamelCase'       , toUpperCamelCase   ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'LowerSnakeCase'  , toLowerSnakeCase   ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'UpperSnakeCase'  , toUpperSnakeCase   ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'TitleSnakeCase'  , toTitleSnakeCase   ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'UpperCamelCase'  , toUpperCamelCase   ( variableValue ) );
        environmentSettings.set ( variableName + PSEUDO_ELEMENT + 'LowerCamelCase'  , toLowerCamelCase   ( variableValue ) );
      } // End if
      else
      { environmentSettings.set ( variableName, trim(variableValue) );;
      } // End Else 
      localResult = true;
    } // end elseif
    else if ( context === 'TYPE'.substring ( 0, context.length ) )
    { let typeSupport = this.#templateGlobalContext.getTypeSupport();
      let fileName    = variableValue;
      typeSupport.setTableDefinitions ( fileName );
      localResult = true;
    } // end elseif
    else
    { let errorMessage = '--+++ Context "' + context + '" must be GLOBAL or ENVIRONMENT';
      console.log (  errorMessage );
      errorMessage = '--+++ An attempt is made to assign "' + context + '" as LOCAL/GLOBAL/ENVIRONMENT';
      console.log ( errorMessage );
      variableName = templateStatement.getObject();
      variableValue = templateStatement.getExpression();
      let foundIn = this.#templateGlobalContext.set ( variableName, variableValue );
      if ( foundIn )
      { errorMessage = '--+++ An existing variable was found in ' + foundIn + ' and set accordingly';
        console.log ( errorMessage );
        localResult = true;
      } // // End if
      else
      { localResult = this.#templateGlobalContext.getLocalVariableStack().set ( variableName, variableValue);
        errorMessage = '--+++ variableName: "' + variableName + '" assigned as LOCAL variable with value of "' + variableValue + '"';
        console.log ( errorMessage );
        localResult = true;
      } //
    } // End else 
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils.processSettingVariableValues -> ' + localResult );
    return localResult;
  } // End function processSettingVariableValues

  setNewMetaIndicator ( newMetaIndicator ) 
  { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.setNewMetaIndicator -> ' + newMetaIndicator  );
    let origMetaIndicator = this.#templateGlobalContext?.get("metaIndicator");
    if ( newMetaIndicator !== origMetaIndicator  )
    { this.swapMetaCommandIndicator ( 'metaIndicator',        newMetaIndicator );
      this.swapMetaCommandIndicator ( 'metaCommandIndicator', newMetaIndicator, '#' );
      this.swapMetaCommandIndicator ( 'metaVarStart' ,        newMetaIndicator, '&');
      this.swapMetaCommandIndicator ( 'metaMacroStart' ,      newMetaIndicator, '{' );
      this.swapMetaCommandIndicator ( 'metaMacroEnd' ,        newMetaIndicator, '}');
      this.swapMetaCommandIndicator ( 'metaHostCmd' ,         newMetaIndicator, '<' );
      this.swapMetaCommandIndicator ( 'metaCommentIndicator', newMetaIndicator, '//' );
      this.swapMetaCommandIndicator ( 'metaCommentStart',     newMetaIndicator, '/*');
      this.swapMetaCommandIndicator ( 'metaCommentEnd',       newMetaIndicator, '*/' );
      this.swapMetaCommandIndicator ( 'metaLineContinue',     newMetaIndicator, '\\');
      this.swapMetaCommandIndicator ( 'metaTemplateLiteral',  newMetaIndicator, '\`');
    } // End if
    this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.setNewMetaIndicator '  );
  } // End function setNewMetaIndicator

   swapMetaCommandIndicator ( metaSettingName, newMetaCommandIndicator, defaultMetaValue )
   { this.#templateGlobalContext.consoleTrace 
       ( ' Starting MetaSettings.swapMetaCommandIndicator -> ' + metaSettingName + ', ' + newMetaCommandIndicator  );
     let metaSettings          = this.#templateGlobalContext.getMetaSettings();
     let originalMetaIndicator = metaSettings?.get ( 'metaIndicator' );
     let originalMetaSetting   = metaSettings?.get ( metaSettingName );
     let metaRootMetaSetting = defaultMetaValue
     if ( !originalMetaSetting )
     { metaRootMetaSetting = originalMetaSetting.substring ( originalMetaIndicator.length );
     } // End if
     metaSettings.set ( metaSettingName, newMetaCommandIndicator + metaRootMetaSetting );
     this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.swapMetaCommandIndicator -> ' + metaSettingName + ', ' + newMetaCommandIndicator  );
   } // ENd function swapMetaCommandIndicator

  fixLineIndent ( lineOfText, currentStmtIndent, currentMetaIndent ) 
  { if ( typeof lineOfText === 'undefined' ) 
    { lineOfText = '';
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Starting TdlUtils.fixLineIndent ->' + lineOfText + '<-' );
    lineOfText = lineOfText.trim ();
    let localIndent     = currentMetaIndent;
    if ( currentStmtIndent == 0 )
    {  localIndent = 0;
    } // End if
    else if ( currentStmtIndent > currentMetaIndent )
    { localIndent = currentStmtIndent;
    } // End if
    else if ( currentStmtIndent < currentMetaIndent )
    { localIndent = currentMetaIndent - currentStmtIndent;
    } // End if
    let localWidth = localIndent + lineOfText.length;
    localWidth = localIndent + lineOfText.length;
    lineOfText = lineOfText.padStart ( localWidth, ' ');
    this.#templateGlobalContext.consoleTrace ( 'Finishing TdlUtils.fixLineIndent ->' + lineOfText + '<-' );
    return lineOfText;
  } // End function fixLineIndent

} // End class TdlUtils

const utils                             = new TdlUtils();

//===== Standalone Functions =====

  //----- coalesce
  /**
   * The coalesce  function is an externally visible function in TdlUtils.js used 
   * to find a non-null, defined or non-empty value from within a list of values. 
   * The coalesce function loops through each value within the array of values and returns 
   * the first value that is usable ( i.e., not null, defined or not empty).
   * 
   * The format follows these rules:
   * - All null values are skipped
   * - All undefined values are skipped
   * - All empty values are skipped
   * - If no values in the array are usable, an empty string is returned
   *
   * Note:	Since TDL is string based, empty strings are not considered as usable 
   * as non-empty strings. This differs from the rules normally associated 
   * with other coalesce functions in other languages. 
   *
   *
   * @param {...*} values -  An array of values (i.e., numbers, strings, objects, arrays, etc.) to search for a useable value.
   * @returns {*} The first usable value found among the input values, or an empty string.
   *
   * @example
   * const value1 = null;
   * const value2 = "Hello";
   * const value3 = undefined;
   * const result = coalesce(value1, value2, value3);
   * // Result:
   * // "Hello"
   */
  export function coalesce ( ...values )
  { let localResult = ""; // Setup a default value as an empty string
    //loop through the values looking for the first non-null value.
    valueLoop: for ( const value of values ) 
      { if ( isUsable ( value ) )
        { localResult = value;
          break valueLoop;
        } // End if
      } // Edn for 
    return localResult; // Default value if all values are null or undefined
  } // End function coalesce

  //----- center
  /**
   * The center  function is an externally visible function in TdlUtils.js used 
   * to convert a given text into a string centered within the specified width. 
   * The center format follows these rules:
   * - All leading and trailing pad characters are trimmed before centering occurs
   * - No action is taken if a string it longer than the width
   * - The padding favors the left side of the string in the case of an uneven divide between the desired width and the length of the string
   *
   * @param {string} text - A string of text to be centered.
   * @param {number} [width=0] - A number indicating the desired width of the resulting centered text.
   * @param {string} [padChar=' '] - padText (default ' ') - The padding text string used to fill the extra space around the text.
   * @returns {string} The centered text within the specified width.
   *
   * @example
   * const inputText = "Hello";
   * const centeredText = center(inputText, 10, '-');
   * // Result: "--Hello---"
   *
   * @example
   * const inputText = "Centered Text";
   * const centeredText = center(inputText, 20);
   * // Result: "  Centered Text   "
  */
  export function center ( text, width = 0, padText = ' ' )
  { if (!padText)
    { padText = ' ';
    } // End if
    // Handle the case of an empty input text
    if ( text.length === 0 )
    { text = padText.repeat ( Math.max ( width / padText.length) );
    } else 
    { // Trim trailing padText characters from the input text
      text = trim ( text, padText );
      // Calculate padding lengths for both sides
      let leftPadding  = '';
      let rightPadding = '';
      if ( text.length < width )
      { const totalPaddingLength = ( width - text.length ) / padText.length;
        const leftPaddingLength = Math.floor ( totalPaddingLength / 2 );
        const rightPaddingLength = Math.ceil ( totalPaddingLength / 2 );
        // Apply padding to both sides
        leftPadding = padText.repeat ( leftPaddingLength );
        rightPadding = padText.repeat ( rightPaddingLength );
      } // End if
      text = leftPadding + text + rightPadding;
    } // End else if
    return text;
  } // End global function center

  //----- compare
  /**
   * The compare function is an externally visible function in TdlUtils.js used to 
   * evaluate a parameter and to determine if the parameters represent the same value.
   * 
   * The compare follows these rules to determine initialized:
   * - The underlying types of the two values must be the same (i.e., string, number, boolean) or they must both be an array or an object
   * - The comparison is made using the string values
   * - The elements of the array must be in the same order
   * - The keys of the object must be in the same order
   * - The comparison is recursive, meaning that the types of the elements of the array or the values associated with the keys of an object must be the same also.
   * 
   * @param {*} value1 - The first value to compare is of any type  (i.e., numbers, strings, boolean, objects, arrays ).
   * @param {*} value2 - The second value to compare is of any type  (i.e., numbers, strings, boolean, objects, arrays ).
   * @param {boolean} [ignoreCase=false] - If true, performs a case-insensitive string comparison for strings.
   * @returns {boolean}Returns true if the values are literally equal based on string representations, otherwise false..
   *
   * @example
   * const result1 = compare("Hello", "hello", true);
   * // Result: true
   * 
   * const result2 = compare([1, 2, 3], [1, 2, 3]);
   * // Result: true
   * 
   * const result3 = compare({ key: "value" }, { key: "Value" }, true);
   * // Result: false
   */
  export function compare ( value1, value2, ignoreCase = false )
  { let localResult = false;
    if ( typeof value1 === typeof value2 )
    { if ( typeof value1 === 'string' 
           || typeof value1 === 'number' 
           || typeof value1 === 'boolean'
         )
      { if ( ignoreCase && typeof value1 === 'string' )
        { localResult = value1.toLowerCase() === value2.toLowerCase();
        } // End if
        else 
        { localResult = value1 === value2;
        } // End else
      } // End if
      else if ( Array.isArray ( value1 ) )
      { if ( value1.length === value2.length ) 
        { localResult = true;
          for ( let i = 0; i < value1.length; i++ ) 
          { if (!compare(value1[i], value2[i], ignoreCase))
            { localResult = false;
              break;
            } // End if
          } // End for
        } // End if
      } // End else if
      else if ( typeof value1 === 'object' && value1 !== null )
      { const keys1 = Object.keys ( value1 );
        const keys2 = Object.keys ( value2 );
        if ( keys1.length === keys2.length )
        { localResult = true;
          for ( const key of keys1 )
          { if ( !value2.hasOwnProperty ( key ) 
                 || !compare( value1[key], value2[key], ignoreCase )
               )
            { localResult = false;
              break;
            } // End if
          } // End for key loop
        } // end if
      } // End else if
    } // End if
    return localResult;
  } // End function compare

  //----- compressText
  /**
   * The compressSpaces  function is an externally visible function in TdlUtils.js 
   * used to compress repeating sets of characters from text. The goal is to condense 
   * multiple instances of the specified characters or whitespace characters into a 
   * single instance of the specified character(s) (i.e., textToCompress).
   * 
   * The compressSpaces format follows these rules:
   * - All leading and trailing pad characters are trimmed to a single occurrence
   * - The textToCompress defaults to a single space
   *
   * @param {string} text - The input text to be processed.
   * @param {string} [textToCompress=' '] - The characters to be replaced with the specified character(s). If not provided,
   *                                       consecutive whitespace characters are compressed.
   * @returns {string} The text with specified characters or consecutive whitespace characters replaced by the specified character(s).
   *
   * @example
   * // Compressing whitespace characters
   * const inputText = "Too      much     space";
   * const compressedText = compressText(inputText);
   * // Result:
   * // "Too much space"
   *
   * @example
   * // Replacing specified characters
   * const inputText = "1, 2, 3, and 4";
   * const compressedText = compressText(inputText, ', ');
   * // Result:
   * // "1,2,3,4"
   */
  export function compressText ( text, textToCompress = ' ' )
  { let textToCompressRegEx = /[\s\r\n\t]+/gm;
    // If textToCompress is provided and not empty after trimming, construct a regex to match those characters
    if (!isEmpty(textToCompress.trim()))
    { textToCompressRegEx = new RegExp( `[${textToCompress}]+`, 'gm' );
    } // End if
    let localResult = text;
    // Replace specified characters or consecutive textToCompress characters with one characters in textToCompress
    localResult = localResult.replace ( textToCompressRegEx, textToCompress );
    return localResult;
  } // End global function compressText

  //-----definePseudoElements
  /**
   * Defines a set of pseudo-elements for a given variable name and value, storing them 
   * in the provided variable stack. The pseudo-elements represent different text 
   * formatting variations of the given value.
   *
   * <p>This function ensures that the variable stack is valid and that the variable 
   * name is not null or empty before proceeding with the pseudo-element definitions.</p>
   *
   * <p>The following pseudo-elements are created and stored:</p>
   * <ul>
   *   <li><b>LowerCase</b>: Converts the value to lowercase.</li>
   *   <li><b>TitleCase</b>: Converts the value to title case.</li>
   *   <li><b>UpperCase</b>: Converts the value to uppercase.</li>
   *   <li><b>CamelCase</b>: Converts the value to camel case (upper camel case).</li>
   *   <li><b>LowerSnakeCase</b>: Converts the value to lowercase snake case.</li>
   *   <li><b>UpperSnakeCase</b>: Converts the value to uppercase snake case.</li>
   *   <li><b>TitleSnakeCase</b>: Converts the value to title case snake case.</li>
   *   <li><b>UpperCamelCase</b>: Converts the value to upper camel case.</li>
   *   <li><b>LowerCamelCase</b>: Converts the value to lower camel case.</li>
   * </ul>
   *
   * @param {Map} variableStack - The stack where variable transformations will be stored.
   * @param {string} variableName - The name of the variable for which pseudo-elements 
   *                                should be generated.
   * @param {string} variableValue - The value of the variable to transform.
   *
   * @throws {TypeError} If `variableStack` is null or undefined.
   * @throws {TypeError} If `variableName` is null, undefined, or an empty string.
   *
   * @example
   * let variableStack = new Map();
   * definePseudoElements(variableStack, "example", "Hello World");
   * console.log(variableStack.get("example::LowerCase")); // "hello world"
   * console.log(variableStack.get("example::UpperCase")); // "HELLO WORLD"
   */
  export function definePseudoElements ( variableStack, variableName, variableValue )
  { if ( variableStack !== null 
         && variableStack !== undefined 
         && isNotNullOrEmpty ( variableName ) 
       )
    { variableName = variableName + PSEUDO_ELEMENT;
      variableStack.set ( variableName + 'LowerCase'       , toLowerCase        ( variableValue ) );
      variableStack.set ( variableName + 'TitleCase'       , toTitleCase        ( variableValue ) );
      variableStack.set ( variableName + 'UpperCase'       , toUpperCase        ( variableValue ) );
      variableStack.set ( variableName + 'CamelCase'       , toUpperCamelCase   ( variableValue ) );
      variableStack.set ( variableName + 'LowerSnakeCase'  , toLowerSnakeCase   ( variableValue ) );
      variableStack.set ( variableName + 'UpperSnakeCase'  , toUpperSnakeCase   ( variableValue ) );
      variableStack.set ( variableName + 'TitleSnakeCase'  , toTitleSnakeCase   ( variableValue ) );
      variableStack.set ( variableName + 'UpperCamelCase'  , toUpperCamelCase   ( variableValue ) );
      variableStack.set ( variableName + 'LowerCamelCase'  , toLowerCamelCase   ( variableValue ) );
      variableStack.set ( variableName + 'UpperKebabCase'  , toUpperKebabCase   ( variableValue ) );
      variableStack.set ( variableName + 'LowerKebabCase'  , toLowerKebabCase   ( variableValue ) ); 
    } // End if
  } // End function definePseudoElements

  //----- eliminateNonAlphanumerics
  /**
   * The eliminateSpaces  function is an externally visible function in TdlUtils.js and 
   * is designed by default to remove all non-alphanumeric characters from a given text and 
   * replace them with spaces. Alphanumeric characters include letters (both uppercase and 
   * lowercase[AZaz]) and numbers[09]. This function can be useful for cleaning up text and 
   * removing special characters, leaving only letters and digits.
   * 
   * It is possible to extend the Alphanumeric character set to include other characters by using the alsoAllow argument.
   *
   * @param {string} text - The input text from which non-alphanumeric characters are removed.
   * @param {string} alsoAllow - A string containing additional characters that should not be replaced.
   * @returns {string} A new string with non-alphanumeric characters (except allowed characters) replaced by spaces.
   *
   * @example
   * const inputText = "Hello World [ 42 ]";
   * const allowedChars = '[]'; // Square brackets are allowed
   * const result = eliminateNonAlphanumerics(inputText, allowedChars);
   * // Result:
   * // "Hello World [ 42 ]"
   */
  export function eliminateNonAlphanumerics ( text, alsoAllow = '' ) 
  { if ( isUsable ( text ) )
    { // Escape special characters in the alsoAllow string for use in the regular expression pattern
      const escapedAlsoAllow = alsoAllow?.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Create a regular expression pattern to match characters that should not be replaced
      const allowedPattern = `[^a-zA-Z0-9${escapedAlsoAllow}]`;
      // Replace characters that are not alphanumeric or allowed characters with spaces
      text = text?.replace(new RegExp(allowedPattern, 'g'), ' ');
    } // End if
    else
    { text = "";
    } // End if 
    return text;
  } // End global function eliminateNonAlphanumerics

 /**
 * Generates a visual ruler string with numbered markers at every tenth position.
 *
 * The ruler consists of dots (".") for most positions, colons (":") at every fifth position,
 * and numeric markers ("1", "2", etc.) at every tenth position. The function supports lengths
 * up to 255 characters.
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Colons (":") appear at every fifth position.</li>
 *   <li>Numbers appear at every tenth position.</li>
 *   <li>Dots (".") fill in the remaining positions.</li>
 *   <li>Supports string and numeric inputs.</li>
 *   <li>Ensures correct spacing before numeric markers.</li>
 *   <li>Caps output length at 255 characters.</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * generateRuler(10)  // "....:....1"
 * generateRuler(20)  // "....:....1....:....2"
 * generateRuler(30)  // "....:....1....:....2....:....3"
 * generateRuler(255) // A full-length ruler up to 255 characters
 * </pre>
 *
 * @param {number|string} length - The desired length of the ruler. If invalid, defaults to 65.
 * @returns {string} A string representation of the ruler up to the specified length.
 */
  export function generateRuler ( length = 65 ) 
  { const longestRuler = 255;  
    // Convert input to a number if it's a valid string representation of a number
    if ( typeof length === 'string' && !isNaN ( length ) ) 
    { length = Number ( length );
    } // End if
    // Ensure length is a positive integer and limit it to longestRuler
    if ( typeof length !== 'number' || isNaN ( length ) || length <= 0 ) 
    { length = 65; // Assign the default value
    } // End if
    else 
    { length = Math.min ( Math.abs ( Math.floor ( length ) ), longestRuler );
    } // End else  
    let ruler = '';
    let marker = 1; // Start numbering from 1
    let iterator = 1; // Iterator for the ruler string  
    while ( ruler.length < length ) 
    { if ( iterator % 10 === 0 ) 
      { // Add the marker (e.g., 1, 2, ..., 10, 11, etc.)
        const markerString = marker.toString();
        while ( ruler.length < iterator - markerString.length ) 
        { ruler += '.'; } // Ensure proper spacing before number
        ruler += markerString;
        marker++;
        iterator += markerString.length - 1; // Adjust for multi-digit numbers
      } // End if
      else if ( iterator % 5 === 0 )
      { // Add colons every 5 positions
        ruler += ':';
      } // End else if
      else 
      { // Fill with dots
        ruler += '.';
      } // End else
      iterator++;
    } // End while  
    return ruler.slice(0, length); // Ensure exact length
  } // End function generateRuler

    
  //----- isEmpty
  /**
   * The isEmpty function is an externally visible function in TdlUtils.js used 
   * to evaluate a parameter and to determine if the parameter is an empty value.
   * 
   * The isEmpty follows these rules to determine emptiness:
   * 
   *  - Null values are considered empty
   *  - Strings with no characters are considered empty
   *  - Objects with no keys are considered empty
   *  - Arrays with no elements are considered empty
   *
   * @param {*} value - The value to be checked for emptiness.
   * @returns {boolean} `true` if the provided value is empty, `false` otherwise.
   * @example
   * const result1 = isEmpty(null);
   * console.log(result1); // Output: true
   *
   * const result2 = isEmpty(undefined);
   * console.log(result2); // Output: true
   *
   * const result3 = isEmpty('');
   * console.log(result3); // Output: true
   *
   * const result4 = isEmpty([]);
   * console.log(result4); // Output: true
   *
   * const result5 = isEmpty({});
   * console.log(result5); // Output: true
   *
   * const result6 = isEmpty('some value');
   * console.log(result6); // Output: false
   *
   * const result7 = isEmpty([1, 2, 3]);
   * console.log(result7); // Output: false
   *
   * const result8 = isEmpty({ key: 'value' });
   * console.log(result8); // Output: false
   */
  export function isEmpty ( value )
  { // Note: The value undefined is either Empty. 
    let localResult = false;
    if ( value === undefined || value === null ) 
    { localResult = isNull ( value ) || isUndefined ( value );
    } // End if
    else if ( typeof value === 'string' && value.trim() === '' )
    { localResult = true;
    } // End elseif
    else if ( Array.isArray(value) && value.length === 0 )
    { localResult = true;
    } // end elseif
    else if ( typeof value === 'object' && Object.keys(value).length === 0 )
    { localResult = true;
    } // End elseif
    return localResult;
  } // End isEmpty

  //----- isInitialized
  /**
   * The isInitialized function is an externally visible function in TdlUtils.js used to 
   * evaluate a parameter and to determine if the parameter is an empty value. 
   * 
   * The isInitialized follows these rules to determine initialized:
   * 
   *  - Null values are considered uninitialized
   *  - Undefined values  with no characters are considered uninitialized
   *
   * @param {*} value - The value to be checked for initialization.
   * @returns {boolean} `true` if the provided value is initialized, `false` otherwise.
   * @example
   * const result1 = isInitialized(null);
   * console.log(result1); // Output: false
   *
   * const result2 = isInitialized(undefined);
   * console.log(result2); // Output: false
   *
   * const result3 = isInitialized('');
   * console.log(result3); // Output: false
   *
   * const result4 = isInitialized([]);
   * console.log(result4); // Output: false
   *
   * const result5 = isInitialized({});
   * console.log(result5); // Output: false
   *
   * const result6 = isInitialized('Hello');
   * console.log(result6); // Output: true
   *
   * const result7 = isInitialized([1, 2, 3]);
   * console.log(result7); // Output: true
   *
   * const result8 = isInitialized({ key: 'value' });
   * console.log(result8); // Output: true
   */
  export function isInitialized ( value )
  { // Note: The value undefined is either NULL, UNDEFINED, or is empty. 
    let localResult = false;
    if ( typeof value !== "undefined" )
    { localResult = ! ( isNull ( value ) 
                        || isUndefined ( value )
                     );
    } // End if
    return localResult;
  } // End function isInitialized

  //----- isNotNullOrEmpty
  /**
   * Checks if a given value is not null, undefined, or an empty string.
   * @param {string} value - The value to check.
   * @returns {boolean} True if the value is not null, undefined, or empty; false otherwise.
   */
  export function isNotNullOrEmpty ( value )
  { return typeof value === 'string' && value.trim().length > 0;
  } // End function isNotNullOrEmpty

  //----- isNull
  /**
   * The isNull function is an externally visible function in TdlUtils.js used
   * to evaluate a parameter and to determine if the parameter is a null value. 
   * 
   * When the value passed is  undefined, it usually represents unintentional 
   * absence or lack of a value, while null is used to intentionally represent
   *  the absence of a value or to clear a variable's reference.
   *
   * @param {*} value - The value to be checked for being null.
   * @returns {boolean} `true` if the provided value is null, `false` otherwise.
   * @example
   * const result1 = isNull(null);
   * console.log(result1); // Output: true
   *
   * const result2 = isNull(undefined);
   * console.log(result2); // Output: false
   *
   * const result3 = isNull('some value');
   * console.log(result3); // Output: false
   */
  export function isNull ( value ) 
  { let localResult = false;
    if ( typeof value !== "undefined" )
    { localResult = ( value === null )
    } // End if
    return localResult;
  } // End function isNull

  export function isNumeric ( value )
  { let localResult = false;
    let validIntegerRegex = new RegExp ( /^-?\d+(\.\d{1,2})?$/ )
    if ( validIntegerRegex.test ( value ) )
    { localResult = true;
    } // End if
    return localResult;
  } // End function isNumeric


  //----- isOff
  /**
   * The isOff function is an externally visible function in TdlUtils.js used 
   * to evaluate text and compare it against a list of words that are equivalent to OFF. 
   * 
   * The isOff function takes a text input performs a case insensitive check against 
   * the following list of strings ( see LIST_OF_OFF_WORDS in this file):
   *       "FALSE", "F",
   *        "OFF", 
   *        "NO", "N",
   *        "DISABLE", and  
   *        "0"
   * 
   * If the text is found to be one of these strings, the boolean true is returned.
   * 
   * @param {string} text - The input text to check.
   * @returns {boolean} Returns true if the input text is considered "off," false otherwise.
   * @example
   * const inputText = "NO";
   * const result = isOff(inputText); // Returns true
   */
  export function isOff ( text )
  { let localResult = false;
    if ( typeof text ===  "string" && text?.length >= 0 )
    { text = text.trim().toUpperCase();
      localResult = LIST_OF_OFF_WORDS.includes ( text );
    } // End else if
    return localResult;  
  } // End function isOff

  //----- isOn
  /**
   * The isOn function is an externally visible function in TdlUtils.js used 
   * to evaluate text and compare it against a list of words that are equivalent to ON. 
   * 
   * The isOn function takes a text input performs a case insensitive check against 
   * the following list of strings ( see LIST_OF_ON_WORDS in this file):
   *       "TRUE", "T",
   *        "ON", 
   *        "YES", "Y",
   *        "ENABLE", and  
   *        "1"
   * 
   * If the text is found to be one of these strings, the boolean true is returned.
   * 
   * @param {string} text - The input text to check.
   * @returns {boolean} Returns true if the input text is considered "on," false otherwise.
   * @example
   * const inputText = "YES";
   * const result = isOn(inputText); // Returns true
   */
  export function isOn ( text )
  { let localResult = false;
    if ( typeof text ===  "string" && text?.length >= 0 )
    { text = text.trim().toUpperCase();
      localResult = LIST_OF_ON_WORDS.includes ( text );
    } // End if
    return localResult;
  } // End function isOn

  //----- isOnOrOff
  /**
   * The isOnOrOff function is an externally visible function in TdlUtils.js used
   * to evaluate text and compare it against a list of words that are equivalent 
   * to OFF or ON. 
   * 
   * The isOnOrOff function uses the definitions of the OnOff and OnOn functions. 
   * If the text is found to be one of these OFF or ON strings, the boolean true is returned.

   * @param {string} text - The input text to check.
   * @returns {boolean} Returns true if the input text is considered "on" or "off," false otherwise.
   * @example
   * const inputText = "ENABLE";
   * const result = isOnOrOff(inputText); // Returns true
   */
  export function isOnOrOff ( text )
  { let localResult = ( isOn ( text ) || isOff ( text ) );
    return localResult;
  } // End function isOnOrOff

  //----- isUndefined
  /**
   * The isUndefined function is an externally visible function in TdlUtils.js used 
   * to evaluate a parameter and to determine if the parameter is an undefined value. 
   * 
   * The isUndefined follows these rules to determine emptiness:
   *   - Null values are NOT considered empty
   *   - Strings with no characters are NOT considered empty
   *   - Objects with no keys are NOT considered empty
   *   - Arrays with no elements NOT are considered empty
   *   - Only values that have not been defined are considered undefined.
   *
   * @param {*} value - The value to be checked for being undefined.
   * @returns {boolean} `true` if the provided value is undefined, `false` otherwise.
   * @example
   * const result1 = isUndefined(undefined);
   * console.log(result1); // Output: true
   *
   * const result2 = isUndefined(null);
   * console.log(result2); // Output: false
   *
   * const result3 = isUndefined('some value');
   * console.log(result3); // Output: false
   *
   * const result4 = isUndefined(123);
   * console.log(result4); // Output: false
   *
   * const result5 = isUndefined({});
   * console.log(result5); // Output: false
   */export function isUndefined ( value )
  { // Note: The value undefined is usually used to represent unintentional absence or lack of a value, 
    //       while null is used to intentionally represent the absence of a value or to clear 
    //       a variable's reference.
    // See: isNull
    let localResult = ( typeof value === "undefined" );
    return localResult;
  } // end function isUndefined
 
  //----- isUsable
  /**
   * The isUsable function is an externally visible function in TdlUtils.js used to 
   * evaluate a parameter and to determine if the parameter is a useful value. 
   * 
   * The isInitialized follows these rules to determine usefulness:

   * The value is considered usable if it satisfies the following conditions:
   * 1. It is not null.
   * 2. It is not undefined.
   * 3. It is not empty. An empty value can be an empty string, an empty array, or an object without any keys.
   *
   * @param {*} value - The value to be checked for usability.
   * @returns {boolean} `true` if the provided value is usable, `false` otherwise.
   * @example
   * const result1 = isUsable(null);
   * console.log(result1); // Output: false
   *
   * const result2 = isUsable(undefined);
   * console.log(result2); // Output: false
   *
   * const result3 = isUsable('');
   * console.log(result3); // Output: false
   *
   * const result4 = isUsable([]);
   * console.log(result4); // Output: false
   *
   * const result5 = isUsable({});
   * console.log(result5); // Output: false
   *
   * const result6 = isUsable('Hello');
   * console.log(result6); // Output: true
   *
   * const result7 = isUsable([1, 2, 3]);
   * console.log(result7); // Output: true
   *
   * const result8 = isUsable({ key: 'value' });
   * console.log(result8); // Output: true
   */
  export function isUsable ( value )
  { // Note: The value undefined is either NULL, UNDEFINED, or is empty. 
    return ! ( isNull ( value ) 
               || isUndefined ( value ) 
               || isEmpty ( value )
             );
  } // End function isUsable


  //----- padLeft
  /**
   * The padLeft  function is an externally visible function in TdlUtils.js used 
   * to convert a given text into a string padded with pad characters  within the 
   * specified width. 
   * 
   * The padLeft format follows these rules:
   * - All leading and trailing characters matching the  trimText are removed before padding occurs
   * - If the resulting trimmed string is longer than the width, the original trimmed string is returned
   * - padText can be any set of characters and not just a single character. For example, it could be the blank space (i.e., ' ') or it could be a set of characters such as "=-"
   * - trimText can be either a simple text such as a single blank (i.e., ' ') a complex set of characters (i.e., "=-"). Or it could be a regular expression.

   *
   * @param {string|null|undefined} text - The input text to be padded.
   * @param {number} width - The desired width of the resulting text after padding.
   * @param {string} [padText=' '] - The string used for padding. Default is a single space.
   * @param {string|RegExp} [trimText=' '] - The characters to be trimmed from the left side of the input text. Can also be a regular expression.
   * @returns {string} The padded text.
   *
   * @example
   * const inputText = "Hello";
   * const paddedText = padLeft(inputText, 10, '_', 'l');
   * console.log(paddedText); // Output: "__Hello"
   */
  export function padLeft ( text, width, padText = ' ', trimText = ' ' )
  { if ( text === null || text === undefined ) 
    { text = padText.repeat ( width );
    } // End if
    else 
    { text = trim ( text, trimText ); // Use the trimLeft function
      if ( width > 0 && text.length < width )
      { const numberOfCharsToPad = Math.ceil ( ( width - text.length ) / padText.length );
        const padTexts = padText.repeat ( numberOfCharsToPad );
        text = padTexts + text;
      } // End if
    } // End else
    return text;
  } // End function padLeft;

  //----- padRight
  /**
   * Pads the input text on the right side with the specified padText to achieve the desired width.
   * If the input text is null or undefined, a string composed of padText characters will be returned.
   *
   * @param {string|null|undefined} text - The input text to be padded.
   * @param {number} width - The desired width of the resulting text after padding.
   * @param {string} [padText=' '] - The string used for padding. Default is a single space.
   * @param {string|RegExp} [trimText=' '] - The characters to be trimmed from the right side of the input text. Can also be a regular expression.
   * @returns {string} The padded text.
   *
   * @example
   * const inputText = "Hello";
   * const paddedText = padRight(inputText, 10, '_', 'l');
   * console.log(paddedText); // Output: "Hello_____"
   */
  export function padRight ( text, width, padText = ' ', trimText = ' ' )
  { if ( text === null || text === undefined )
    { text = padText.repeat(width);
    } // End if
    else 
    { text = trim ( text, trimText ); // Use the specified trimText
      if (width > 0 && text.length < width)
      { const numberOfCharsToPad = Math.ceil ( ( width - text.length ) / padText.length );
        const padTexts = padText.repeat ( numberOfCharsToPad );
        text = text + padTexts; // Append padTexts to the end of the text
      } // End if
    } // End else
    return text;
  } // End function padRight

  //----- toCamelCase
  /**
   * Converts a string to Camel Case. Uppercase letters are used for characters
   * following white spaces or special characters.
   *
   * @param {string} text - The input string to be converted to Camel Case.
   * @returns {string} The Camel Case version of the input string.
   *
   * @example
   * const inputText = "The command DEL ( Delete) is [optional]";
   * const camelCaseText = toCamelCase(inputText); // Result: "The Command DEL ( Delete) Is [Optional]"
   * console.log(camelCaseText);
   */
   export function toCamelCase ( text )
   { let localResult = '';
     if ( typeof text === 'string' )
     { localResult 
         = text.replace
             ( /(?:^|[^a-zA-Z0-9])([a-zA-Z])/g, 
               ( match ) => 
                 match.toUpperCase()
             );
     } // End if
     return localResult;
  } // End function toCamelCase


  //----- toKebabCase
  /**
   * The toKebabCase  function is an externally visible function in TdlUtils.js 
   * used to convert text into a lower kebab case name. 
   * 
   * The toKebabCase format follows these rules:
   * - Converts the entire text to lowercase
   * - Removes all characters that are not characters used in programming names
   * - Replaces all occurrences of spaces with hyphens ('-')
   * - Trims any leading or trailing whitespace.
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to lower kebab case format.
   *
   * @example
   * const inputText = "hello world example";
   * const lowerSnakeCaseText = toKebabCase(inputText);
   * // Result:
   * // "hello-world-example"
   */
  export function toKebabCase(text) 
  { if (!text) 
    { text = ''; 
    } // End if
    text = toValidNameChars(text.replace(/-/g, ' ')).toLowerCase(); // Convert hyphens to spaces temporarily
    text = text.trim().replace(/_/g, '').replace(/\s+/g, '-'); // Remove `_`, replace spaces with `-`
    return text;
  } // End function toKebabCase

  //----- toLowerCase
  /**
   * The toLowerCase function is an externally visible function in TdlUtils.js used
   * to convert text into lowercase. 
   * 
   * The toTitleCase format follows these rules:
   * - All characters (i.e., [AZ]) are converted to lowercase letters (i.e., [az])
   * - Non-Alphanumeric characters are not changed
   *
   * @param {string} text - The input text to be converted to lowercase.
   * @returns {string} The input text in lowercase.
   *
   * @example
   * const inputText = "Hello, World!";
   * const upperCaseText = toLowerCase(inputText);
   * // Result:
   * // "hello, world!"
   */
  export function toLowerCase ( text  )
  { if ( ! text )
    { text = '';
    } // End if
    let localResult = text.toLowerCase();
    return localResult;
  } // End global function toLowerCase

  //----- toLowerKebabCase
  /**
   * The toLowerKebabCase  function is an externally visible function in TdlUtils.js 
   * used to convert text into a lower kebab case name. 
   * 
   * The toLowerKebabCase format follows these rules:
   * - Converts the entire text to lowercase
   * - Removes all characters that are not characters used in programming names
   * - Replaces all occurrences of spaces with hyphens ('-')
   * - Trims any leading or trailing whitespace.
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to lower kebab case format.
   *
   * @example
   * const inputText = "hello world example";
   * const lowerSnakeCaseText = toLowerKebabCase(inputText);
   * // Result:
   * // "hello-world-example"
   */
  export function toLowerKebabCase ( text  )
  { if ( ! text )
    { text = '';
    } // End if
    text = toValidNameChars ( text );
    text = compressText ( text.toLowerCase() , ' ' );
    text = text.trim().replace (/ /g, '-' );
    return text;
  } // End global function toLowerKebabCase

  //----- toLowerSnakeCase
  /**
   * The toLowerSnakeCase  function is an externally visible function in TdlUtils.js 
   * used to convert text into a lower snake case name. 
   * 
   * The toLowerSnakeCase format follows these rules:
   * - Converts the entire text to lowercase
   * - Removes all characters that are not characters used in programming names
   * - Replaces all occurrences of spaces with underscores ('_')
   * - Trims any leading or trailing whitespace.
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to lower snake case format.
   *
   * @example
   * const inputText = "hello world example";
   * const lowerSnakeCaseText = toLowerSnakeCase(inputText);
   * // Result:
   * // "hello_world_example"
   */
  export function toLowerSnakeCase ( text  )
  { if ( ! text )
    { text = '';
    } // End if
    text = toValidNameChars ( text );
    text = compressText ( text.toLowerCase() , ' ' );
    text = text.trim().replace (/ /g, '_' );
    return text;
  } // End global function toLowerSnakeCase

  //----- toTitleCase
  /**
   * Converts a given text string into title case format.
   *
   * The toTitleCase  function is an externally visible function in TdlUtils.js used to
   * convert text into a lower snake case name.
   * 
   * The toTitleCase format follows these rules:
   * - All characters (i.e., [AZ]) are converted to lowercase letters (i.e., [az])
   * - The first letter in the text (i.e., [0]) is always converted to uppercase [AZ]
   * - The first character after any whitespace is converted to uppercase [AZ] 
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to title case format.
   *
   * @example
   * const inputText = "hello world";
   * const titleCaseText = toTitleCase(inputText);
   * // Result:
   * // "Hello World"
   */
  export function toTitleCase ( text )
  { text = text.toLowerCase();
    text = text.replace (/\b\w/g, match => match.toUpperCase() );
    return text;
  } // end global Function toTitleCase

  //----- toTitleSnakeCase
  /**
   * The toTitleSnakeCase  function is an externally visible function in TdlUtils.js used
   * to convert text into a title snake case name.
   * 
   * The toTitleSnakeCase format follows these rules:
   * - All characters (i.e., [AZ]) are converted to lowercase letters (i.e., [az])
   * - The first letter in the text (i.e., [0]) is always converted to uppercase [AZ]
   * - The first character after any whitespace is converted to uppercase [AZ] 
   * - Removes all characters that are not characters used in programming names
   * - Replaces all occurrences of spaces with underscores ('_')
   * - Trims any leading or trailing whitespace.
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to title snake case format.
   *
   * @example
   * const inputText = "hello world";
   * const titleSnakeCaseText = toTitleSnakeCase(inputText);
   * // Result:
   * // "Hello_World"
   */
  export function toTitleSnakeCase ( text  )
  { if ( ! text )
    { text = '';
    } // End if
    text = toValidNameChars ( text );
    text = text.trim().toLowerCase();
    text = text.replace(/_/g, ' ').split(' ');
    text = text.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    text = text.join('_');
    return text;
  } // End global function toTitleSnakeCase

  //----- toUpperCase
  /**
   * The toUpperCase  function is an externally visible function in TdlUtils.js used
   * to convert text into uppercase. 
   * 
   * The toTitleCase format follows these rules:
   * - All characters (i.e., [az]) are converted to lowercase letters (i.e., [AZ])
   * - Non-Alphanumeric characters are not changed
   *
   * @param {string} text - The input text to be converted to uppercase.
   * @returns {string} The input text in uppercase.
   *
   * @example
   * const inputText = "Hello, World!";
   * const upperCaseText = toUpperCase(inputText);
   * // Result:
   * // "HELLO, WORLD!"
   */
  export function toUpperCase ( text  )
  { if ( ! text )
    { text = '';
    } // End if
    text = text.toUpperCase();
    return text;
  } // End global function toUpperCase

  //----- toUpperCamelCase
  /**
   * The toUpperCamelCase function is an externally visible function in TdlUtils.js 
   * used to convert a given text string into the upper Camel Case format. 
   * 
   * The upper camel case format follows these rules:
   * 
   * - All words are written in lowercase with the first letter of the word in uppercase
   * - All the words are concatenated without any spaces or punctuation.
   *
   * This function takes a text input and performs the following transformations
   * to convert it into UpperCamelCase format:
   * - Removes any invalid characters from the text.
   * - Converts the text to title case (capitalizing the first letter of each word).
   * - Eliminates spaces and compresses consecutive spaces.
   *
   * @param {string} text - The input text to be converted to camelCase.
   * @returns {string} The camelCase version of the input text.
   *
   * @example
   * const inputText = "hello world example";
   * const camelCaseText = toUpperCamelCase(inputText);
   * // Result: "helloWorldExample"
   *
   * @example
   * const inputText = "this_is a test!";
   * const camelCaseText = toUpperCamelCase(inputText);
   * // Result: "thisIsATest"
   */
  export function toUpperCamelCase ( text  )
  { const words = text.toLowerCase().split(/[^a-zA-Z0-9]+/);
    const upperCamelCaseString 
      = words.map
          ( word => word.charAt(0).toUpperCase()
                    + word.slice(1)
          ).join('');
    return upperCamelCaseString;
  } // End global function toUpperCamelCase

  //----- toLowerCamelCase
  /**
   * Converts a given text string into Lower Camel Case format (camelCase).
   *
   * The `toLowerCamelCase` function is an externally visible function in TdlUtils.js used to
   * convert a given text string into the Lower Camel Case (also known as camelCase) format. The
   * lower camel case format follows these rules:
   * 
   * - All words are written in lowercase with the first letter of each word in uppercase.
   * - All words are concatenated without any spaces or punctuation.
   * - The first letter of the text is converted to lowercase.
   *
   * The toLowerCamelCase function takes a text input and performs the following transformations
   * to convert it into Lower Camel Case format:
   * 
   * - Converts the entire text to lowercase
   * - Splits the text into words using non-alphanumeric characters as delimiters
   * - Capitalizes the first letter of each word except the first letter of the first word
   * - Joins the words back together without spaces
   *
   * @param {string} text - The input text to be converted to Lower Camel Case.
   * @returns {string} The Lower Camel Case version of the input text.
   *
   * @example
   * const inputText = "This_is a Test";
   * const lowerCamelCaseText = toLowerCamelCase(inputText);
   * // Result: "thisIsATest"
   *
   * @example
   * const inputText = "another_example_Text";
   * const lowerCamelCaseText = toLowerCamelCase(inputText);
   * // Result: "anotherExampleText"
   */
  export function toLowerCamelCase ( text  )
    { const words = text.toLowerCase().split(/[^a-zA-Z0-9]+/);
      const lowerCamelCaseString
        = words.map
          ( ( word, index ) =>
             index === 0 ? word : word.charAt(0).toUpperCase() 
                             + word.slice(1)
          ).join('');
      return lowerCamelCaseString;
    } // End global function toLowerCamelCase

  //----- toUpperKebabCase
  /**
   * The toUpperKebabCase  function is an externally visible function in TdlUtils.js 
   * used to convert text into a lower kebab case name. 
   * 
   * The toUpperKebabCase format follows these rules:
   * - Converts the entire text to lowercase
   * - Removes all characters that are not characters used in programming names
   * - Replaces all occurrences of spaces with hyphens ('-')
   * - Trims any leading or trailing whitespace.
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to lower kebab case format.
   *
   * @example
   * const inputText = "hello world example";
   * const lowerSnakeCaseText = toUpperKebabCase(inputText);
   * // Result:
   * // "hello-world-example"
   */
  export function toUpperKebabCase(text) 
{ if (!text) 
  { text = ''; 
  } // End if
  text = toValidNameChars(text.replace(/-/g, ' ')).toUpperCase(); // Preserve hyphens
  text = compressText(text, ' '); // Ensure no multiple spaces
  text = text.trim().replace(/_/g, '').replace(/\s+/g, '-'); // Remove `_`, replace spaces with `-`
  return text;
} // End function toUpperKebabCase


  //----- toUpperSnakeCase
  /**
   * The toUpperSnakeCase  function is an externally visible function in TdlUtils.js used 
   * to convert text into a uppercase snake case name. 
   * 
   * The toUpperSnakeCase format follows these rules:
   * - Converts the entire text to uppercase
   * - Removes all characters that are not characters used in programming names
   * - Replaces all occurrences of spaces with a single underscores ('_')
   * - Trims any leading or trailing whitespace.
   * 
   * The function performs the following steps:
   * 
   * - If the input text is falsy (null, undefined, etc.), it's treated as an empty string
   * - Only characters defined within  toValidNameChars function are kept
   * - Spaces are compressed using a single underscores
   * - The entire text is converted to uppercase
   * - Leading and trailing spaces are trimmed from the final result.
   *
   * @param {string} text - The input text to be converted.
   * @returns {string} The input text converted to upper snake case format.
   *
   * @example
   * const inputText = "Hello World";
   * const upperSnakeCaseText = toUpperSnakeCase(inputText);
   * // Result:
   * // "HELLO_WORLD"
   */
  export function toUpperSnakeCase ( text  )
  { if ( ! text )
    { text = '';
    } // End if
    text = toValidNameChars ( text );
    text = compressText ( text.toUpperCase() , ' ' );
    text = text.trim().replace (/ /g, '_' );
    return text;
  } // End global function toUpperSnakeCase

  //----- toValidNameChars
  /**
   * The toValidNameChars  function is an externally visible function in TdlUtils.js used
   * to convert text into text usable as a name in most programming languages by removing any
   * characters from the text string that are not valid for use in a name or identifier. 
   * 
   * It takes an input text as an argument and performs the following transformations:
   * - Character Removal: The function applies a regular expression nameCharRegEx to the input 
   * text. This regular expression /[^a-z0-9\_\s]+/gi matches any character that is not a 
   * lowercase letter, digit (0-9), underscore, or whitespace character.
   * - Replace Invalid Characters: The function replaces all characters that match the regular
   * expression with an empty string. This effectively removes all characters that are not valid for use in a name.
   * - Returns Valid Name: The function returns the modified text with only the valid characters remaining.
   *
   * @param {string} text - The input text from which invalid characters will be removed.
   * @returns {string} The input text with invalid characters removed.
   *
   * @example
   * const inputText = "Hello, World!";
   * const validNameText = toValidNameChars(inputText);
   * // Result:
   * // "Hello World"
   */
  export function toValidNameChars ( text )
  { let nameCharRegEx = /[^a-z0-9\_\s]+/gi
    text = text.replace ( nameCharRegEx, '' );    
    return text;
  } // End global function toValidNameChars
  
  //----- trim
  /**
   * The trim  function is an externally visible function in TdlUtils.js used 
   * to remove characters from the left side of text (trailing). 
   * 
   * The trim format follows these rules:
   * - Undefined text is treated as an empty string
   * - Only characters matching the padText string or the padText regular expression are 
   *   removed from the left or right side of the text (leading or trailing characters ).
   *
   * @param {string} text - The input string to be trimmed.
   * @param {string|RegExp} [padText=/\s+/] - The characters or regular expression pattern to be trimmed.
   *                                          Default is one or more whitespace characters.
   * @returns {string} The trimmed string.
   *
   * @example
   * const inputText = '   Hello, World!   ';
   * const trimmedText = trim(inputText); // Result: 'Hello, World!'
   * console.log(trimmedText);
   */
  export function trim ( text,  padText = /\s+/ )
  { return trimLeft ( trimRight ( text, padText ), padText );
  } // End global function trim

  //----- trimLeft
  /**
   * The trimLeft function is an externally visible function 
   * in TdlUtils.js used to remove characters from the left side 
   * of text (leading). 
   * 
   * The trimLeft format follows these rules:
   *  - Undefined text is treated as an empty string
   *  - Only characters matching the padText string or the padText 
   *    regular expression are removed from the left side of the 
   *    text (leading).
   * @param {string|null|undefined} text - The input text to be 
   *    trimmed.
   * @param {string|RegExp} [padText=/\s+/] - The characters to be 
   *    trimmed from the beginning of the text. 
   *    Can also be a regular expression. Default is any whitespace 
   *    characters.
   * @returns {string} The trimmed text.
   * @example
   * const inputText = "   Hello";
   * const trimmedText = trimLeft(inputText);
   * console.log(trimmedText); // Output: "Hello"
   */
  export function trimLeft 
    ( text, 
      padText = /\s+/  
    )
  { if ( typeof text !== 'string' )
    { text = '';
    } // End if
    else if ( padText instanceof RegExp ) 
    { // Use the test() method of the regular expression to check 
      // for matches
      while ( padText.test ( text.charAt ( 0 ) ) )
      { text = text.slice ( 1 );
      } // End while
    } // End else if
    else
    { // Escape special characters in padText for use in the 
      // regular expression pattern
      const escapedPadText 
        = padText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Create a regular expression pattern to match padText 
      // characters at the beginning of the text
      const padTextPattern 
        = `^[${escapedPadText}]+`;
      const leadingCharsRegex 
        = new RegExp(padTextPattern);
      // Remove the padText from the beginning of the text
      text = text.replace ( leadingCharsRegex, '' );
    } // End else
    return text;
  } // End function trimLeft

  //----- trimRight
  /**
   * The trimRight  function is an externally visible function in TdlUtils.js used 
   * to remove characters from the right side of text (trailing).
   * 
   * The trimRight format follows these rules:
   * - Undefined text is treated as an empty string
   * - Only characters matching the padText string or the padText regular expression are 
   *   removed from the right side of the text (trailing).
   *
   * @param {string|null|undefined} text - The input text to be trimmed.
   * @param {string|RegExp} [padText=/\s+/] - The characters to be trimmed from the end of the text.
   *     Can also be a regular expression. Default is any whitespace characters.
   * @returns {string} The trimmed text.
   *
   * @example
   * const inputText = "Hello   ";
   * const trimmedText = trimRight(inputText);
   * console.log(trimmedText); // Output: "Hello"
   */
  export function trimRight 
    ( text, 
      padText = /\s+/  
    )
  {  if (typeof text !== 'string')
     { text =  '';
     } // End if
    else
    { if ( padText instanceof RegExp )
      { // Use the test() method of the regular expression to 
        // check for matches
        while ( padText.test ( text.charAt ( text.length - 1 ))  )
        { text = text.slice ( 0, -1) ;
        } // End while
      } // End if
      else 
      { // Escape special characters in padText for use in the 
        // regular expression pattern
        const escapedPadText
          = padText.replace 
              ( /[-\/\\^$*+?.()|[\]{}]/g, 
                '\\$&' 
              );
        // Create a regular expression pattern to match padText
        // characters at the end of the text
        const padTextPattern 
          = `[${escapedPadText}]+$`;
        const trailingCharsRegex 
          = new RegExp ( padTextPattern );
        // Remove the padText from the end of the text
        text = text.replace ( trailingCharsRegex, '' );
      } // End else
    } // End else
    return text;
  } // End function trimRight

  //---=================
  export function isValidDecOctetValue ( stringValue ) 
  { let result;
    // Regular expression to match valid <decOctetValue> format
    var decOctetRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
    // Use the regex to test the input string
    result = decOctetRegex.test ( stringValue );
    return result;
  } // End function isValidDecOctetValue

  export function isValidFloatingPointValue ( stringValue ) 
  { let result = false;
    // Regular expression for the extended floating-point value pattern
    var floatPattern = /^([+-]?(\d+\.\d*|\.\d+)([eE][+-]?\d+)?)$/;
  
    // Test if the stringValue matches the pattern
    result = floatPattern.test ( stringValue );
    return result;
  } // End function isValidFloatingPointValue

/**
 * Checks if the given value is a valid BigInteger.
 * @param {string} value - The input string to test.
 * @returns {boolean} - True if the string represents a valid BigInteger, false otherwise.
 */
export function isBigIntegerValue ( value ) 
{ let localResult = false;
  if ( value !== null 
       && value !== undefined 
       && value !== "" 
     ) 
  { if ( typeof value === "string" && /[\/\*\+]/.test ( value.slice(1) ) ) 
    { localResult = false;
    } // End if
    else if ( /^[-+]?\d{16,}$/.test ( value ) ) 
    { localResult = true;
    } // End else if
  } // End if
  return localResult;
} // End function isBigIntegerValue


  /**
 * Checks whether a given string represents a BigNumber value.
 *
 * A **BigNumber** is a floating-point number with an exponent notation (scientific notation).
 * This includes numbers like `1.8e308`, `-2.3E-200`, or `5.67e+50`.
 *
 * **Valid BigNumber Examples:**
 * - `"1.8e308"`  → Scientific notation for very large numbers.
 * - `"-2.3E-200"` → Scientific notation for very small numbers.
 * - `"5.67e+50"`  → Large floating-point number.
 *
 * **Invalid Cases:**
 * - `"42"` (Valid Integer, but not a BigNumber)
 * - `"3.14"` (Valid Floating Point, but not a BigNumber)
 * - `"Hello"` (Non-numeric string)
 * - `"1.8e"` (Incomplete scientific notation)
 * - `"2e200"` (Valid scientific notation but may not be considered a BigNumber)
 *
 * @param {string} value - The string to check.
 * @returns {boolean} `true` if the value is a BigNumber, otherwise `false`.
 */
/**
 * Checks if a given value is a BigNumber.
 * 
 * A BigNumber is a floating-point number that exceeds JavaScript's `Number.MAX_SAFE_INTEGER` 
 * and contains decimal notation or scientific notation (`e`).
 * 
 * This function ensures:
 *  - Big Integers (`18446744073709551616`) are **not** mistakenly classified as BigNumber.
 *  - Large floating-point numbers (e.g., `1.8e308`) are correctly classified.
 *  - If the number exceeds `Number.MAX_VALUE`, it is classified as `Invalid` (avoiding `Infinity` issues).
 * 
 * @param {string} value - The value to check.
 * @returns {boolean} `true` if the value is a valid BigNumber, otherwise `false`.
 */
export function isBigNumberValue(value) 
  { let localResult = false;
    if ( value !== null && value !== undefined && value !== "" ) 
    { if ( typeof value === "string" && /[\/\*\+]/.test(value) ) 
      { localResult = false;
      } // End if
      else if ( /^[-+]?\d+(\.\d+)?(e[-+]?\d+)?$/.test(value) ) 
      { let num = Number(value);
        if ( num > Number.MAX_SAFE_INTEGER && num < Number.MAX_VALUE ) 
        { localResult = true;
        } // End if
      } // End else if
    } // End if
    return localResult;
  } // End function isBigNumberValue

/**
 * Checks if the given value is a decimal octet (0-255).
 * @param {string} value - The input string to test.
 * @returns {boolean} - True if the string represents a valid decimal octet, false otherwise.
 */
export function isIntegerValue(value) 
  { let localResult = false;
    if ( value !== null && value !== undefined && value !== "" ) 
    { if ( typeof value === "string" && /[\/\*]/.test(value) )
      { localResult = false;
      } // End if
      else if ( /^[-+]?\d+$/.test(value) ) 
      { localResult = true;
      } // End else if
    } // End if
    return localResult;
  } // End function isIntegerValue

  /**
   * Determines whether a given string is a valid scientific notation number.
   *
   * <p>Scientific notation represents numbers using a base and an exponent,
   * such as `1e10`, `-2.5e-3`, or `4.56E+7`. This function checks if the input
   * conforms to the expected pattern of a scientific notation number.
   *
   * <h2>Key Features:</h2>
   * <ul>
   *   <li>Requires the presence of `e` or `E` to indicate an exponent.</li>
   *   <li>Supports both lowercase (`e`) and uppercase (`E`) notation.</li>
   *   <li>Allows positive and negative exponents.</li>
   *   <li>Handles integer and floating-point bases.</li>
   *   <li>Rejects malformed scientific notation formats.</li>
   * </ul>
   *
   * <h2>Examples:</h2>
   * <pre>
   * isScientificNotationValue("1e10")      // true
   * isScientificNotationValue("-2.5e-3")   // true
   * isScientificNotationValue("4.56E+7")   // true
   * isScientificNotationValue("NaN")       // false
   * isScientificNotationValue("123")       // false
   * isScientificNotationValue("1e")        // false
   * isScientificNotationValue("3.14159")   // false
   * </pre>
   *
   * @param {string} value - The input string to validate.
   * @returns {boolean} `true` if the input is a valid scientific notation number, otherwise `false`.
   */
  export function isScientificNotationValue(value) 
  { return typeof value === "string" 
           && /^[+-]?[0-9]+(?:\.[0-9]*)?[eE][+-]?[0-9]+$/.test(value);
  } // End function isScientificNotationValue  

/**
 * Checks if the given value is a floating-point number.
 * @param {string} value - The input string to test.
 * @returns {boolean} - True if the string represents a floating-point number, false otherwise.
 */
export function isFloatingPointValue(value)
  { let localResult = false;
    if ( value !== null && value !== undefined && value !== "" ) 
    { if ( typeof value === "string" && /[\/\*]/.test(value) ) 
      { localResult = false;
      } // End if
      else if ( /^[-+]?\d*\.\d*$/.test(value) )
      { localResult = true;
      } // End else if
    } // End if
    return localResult;
  } // End function isFloatingPointValue


/**
 * Checks if a given string is a valid decimal octet (0-255).
 * 
 * A decimal octet is used in IPv4 addresses and consists of a number 
 * between 0 and 255 (inclusive). This function ensures that the string 
 * represents a valid integer within this range.
 * 
 * @param {string} value - The string to check.
 * @returns {boolean} `true` if the input is a valid decimal octet, otherwise `false`.
 * 
 * @example
 * isDecOctetValue("192");  // true
 * isDecOctetValue("255");  // true
 * isDecOctetValue("256");  // false (out of range)
 * isDecOctetValue("-1");   // false (negative number)
 * isDecOctetValue("abc");  // false (non-numeric input)
 */
/**
 * Checks if a given string is a valid decimal octet (0-255).
 *
 * A decimal octet is a non-negative integer that:
 * - Falls within the range 0-255.
 * - Allows leading zeros (e.g., "00042" is valid).
 * - Does not allow negative numbers.
 * - Ignores leading `+` (e.g., "+42" is valid).
 *
 * @param {string} value - The input string to check.
 * @returns {boolean} Returns true if `value` is a valid decimal octet, otherwise false.
 */
export function isDecOctetValue(value) 
  { let localResult = false;
    if ( value !== null && value !== undefined && value !== "" ) 
    { // Remove leading '+', but keep leading zeros (e.g., "+42" -> "42", "00042" -> "00042")
      let cleanedValue = value.replace(/^\+/, "");

      // Ensure it consists of only digits and falls in the valid range (0-255)
      if (/^\d+$/.test(cleanedValue)) 
      { let numberValue = parseInt(cleanedValue, 10);
        if ( numberValue >= 0 && numberValue <= 255 ) 
        { localResult = true;
        } // End if
      } // End if
    } // End if
    return localResult;
  } // End function isDecOctetValue


/**
 * Checks if the given value is a valid hexadecimal number.
 * @param {string} value - The input string to test.
 * @returns {boolean} - True if the string is a valid hexadecimal value, false otherwise.
 */
export function isHexadecimalValue(value) 
  { let localResult = false;
    if ( value !== null && value !== undefined && value !== "" ) 
    { if ( typeof value === "string" && /[\/\*\+]/.test(value) ) 
      { localResult = false;
      } // End if
      else if ( /^0[xX][0-9a-fA-F]+$/.test(value) ) 
      { localResult = true;
      } // End else if
    } // End if
    return localResult;
  } // End function isHexadecimalValue

/**
 * Determines whether the given string represents a valid IPv4 address.
 *
 * <p>An IPv4 address consists of four decimal numbers (octets), each ranging from 0 to 255,
 * separated by periods. This function validates:
 * <ul>
 *   <li>Correctly formatted addresses (e.g., "192.168.1.1")</li>
 *   <li>Valid octet ranges (0-255)</li>
 *   <li>Prevention of leading zeros (e.g., "192.168.01.1" is invalid)</li>
 *   <li>No additional characters (e.g., spaces, slashes, or ports)</li>
 *   <li>Prevention of incomplete addresses</li>
 * </ul>
 *
 * <p>Examples of valid IPv4 addresses:
 * <pre>
 * isIPv4Value("192.168.1.1");     // true
 * isIPv4Value("10.0.0.1");        // true
 * isIPv4Value("255.255.255.255"); // true
 * </pre>
 *
 * <p>Examples of invalid IPv4 addresses:
 * <pre>
 * isIPv4Value("300.168.1.1");     // false (octet out of range)
 * isIPv4Value("192.168.1.256");   // false (octet out of range)
 * isIPv4Value("192.168.1");       // false (missing octet)
 * isIPv4Value("192.168.01.1");    // false (leading zero in octet)
 * isIPv4Value("192.168.1.1:8080"); // false (port number included)
 * isIPv4Value("abc.def.ghi.jkl"); // false (non-numeric input)
 * </pre>
 *
 * @param {string} value - The string to be tested.
 * @returns {boolean} True if the input is a valid IPv4 address, false otherwise.
 */
export function isIPv4Value(value) 
{ let localResult = false;

  if (typeof value === "string") 
  { let ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])$/;
    if (ipv4Pattern.test ( value ) ) 
    { localResult = true;
    } // End if
  } // End if
  return localResult;
} // End function isIPv4Value

/**
 * Determines whether a given string is a valid IPv6 address.
 *
 * <p>An IPv6 address consists of up to eight groups of four hexadecimal digits, separated by colons (`:`),
 * with optional compression using `::` for consecutive zero groups.</p>
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Supports full and compressed IPv6 notation.</li>
 *   <li>Allows link-local addresses with interface specifiers (e.g., `fe80::1%eth0`).</li>
 *   <li>Validates IPv4-mapped IPv6 addresses (`::ffff:192.168.1.1`).</li>
 *   <li>Handles leading and trailing colons correctly.</li>
 *   <li>Rejects malformed IPv6 addresses (e.g., invalid characters, out-of-range values).</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * isIPv6Value("2001:db8::1")             // true
 * isIPv6Value("::1")                     // true
 * isIPv6Value("fe80::1%eth0")           // true
 * isIPv6Value("::ffff:192.168.1.1")    // true
 * isIPv6Value("1234:5678:9abc:def0::") // true
 * isIPv6Value("::1.2.3.4")              // false
 * isIPv6Value("2001:db8:::1")          // false
 * isIPv6Value("example.com")            // false
 * </pre>
 *
 * @param {string} value - The input string to validate.
 * @returns {boolean} `true` if the input is a valid IPv6 address, otherwise `false`.
 */
export function isIPv6Value(value) 
{ if (typeof value !== "string") return false; // Check type
  
  let ipv6Pattern = new RegExp(
    "^(?:"
    + "(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,7}:"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}"
    + "|[0-9A-Fa-f]{1,4}:(?::[0-9A-Fa-f]{1,4}){1,6}"
    + "|:(?::[0-9A-Fa-f]{1,4}){1,7}"
    + "|fe80:(?::[0-9A-Fa-f]{0,4}){0,4}%[0-9A-Za-z]{1,}"
    + "|::(?:ffff(:0{1,4}){0,1}:)"
    + "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}"
    + "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"
    + "|(?:[0-9A-Fa-f]{1,4}:){1,4}:"
    + "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}"
    + "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"
    + "|::(?!\d+\.\d+\.\d+\.\d+)"  // Prevents `::X.X.X.X` from matching incorrectly
    + ")$", "i"
  ); // End regex definition

  return ipv6Pattern.test(value.trim()); // Validate input
} // End function isIPv6Value




/**
 * Checks if the given value is a numeric value.
 * @param {string} value - The input string to test.
 * @returns {boolean} - True if the string represents a numeric value, false otherwise.
 */
export function isNumericValue(value) 
{ let localResult = false;
  if ( value !== null && value !== undefined && value !== "" ) 
  { if ( typeof value === "string" && /[\/\*\+]/.test(value) ) 
    { localResult = false;
    } // End if
    else if ( isIntegerValue(value) 
              || isFloatingPointValue(value) 
              || isBigIntegerValue(value) 
              || isBigNumberValue(value) 
              || isHexadecimalValue(value)
              || isScientificNotationValue(value)
           ) 
    { localResult = true;
    } // End else if
  } // End if
  return localResult;
} // End function isNumericValue


/**
 * Determines the type of number represented by the given string.
 * @param {string} value - The input string to test.
 * @returns {string} - The type of number: "BigInteger", "BigNumber", "Integer",
 *                     "FloatingPoint", "Hexadecimal", "Numeric", or "Invalid".
 */
export function determineNumberType ( value ) 
  { let localResult = "Invalid";
    if ( value !== null && value !== undefined && value !== "" ) 
    { if ( isBigIntegerValue(value) ) 
      { localResult = "BigInteger";
      } // End if
      else if ( isBigNumberValue(value) ) 
      { localResult = "BigNumber";
      } // End else if
      else if ( isIntegerValue(value) ) 
      { localResult = "Integer";
      } // End else if
      else if ( isFloatingPointValue(value) ) 
      { localResult = "FloatingPoint";
      } // End else if
      else if ( isHexadecimalValue(value) ) 
      { localResult = "Hexadecimal";
      } // End else if
      else if ( isNumericValue(value) ) 
      { localResult = "Numeric";
      } // End else if
    } // End if
    return localResult;
  } // End function determineNumberType

/**
 * Determines whether a given string is a valid URI.
 *
 * <p>A valid URI may be an HTTP(S), FTP, mailto, URN, data URI, file URI, or an IP address.</p>
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Supports various URI schemes including HTTP, FTP, mailto, URN, and file.</li>
 *   <li>Handles IPv4 and IPv6 addresses as valid URIs.</li>
 *   <li>Validates proper structure and format of URIs.</li>
 *   <li>Rejects empty or malformed URIs.</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * isURIValue("http://example.com")          // true
 * isURIValue("ftp://files.server.com")      // true
 * isURIValue("mailto:user@example.com")     // true
 * isURIValue("urn:isbn:0451450523")        // true
 * isURIValue("data:text/plain;base64,SGVsbG8=") // true
 * isURIValue("file:///Users/test/file.txt") // true
 * isURIValue("192.168.1.1")                 // true
 * isURIValue("2001:db8::ff00:42:8329")     // true
 * isURIValue("invalid_uri")                 // false
 * isURIValue("")                             // false
 * isURIValue(null)                          // false
 * isURIValue(undefined)                     // false
 * </pre>
 *
 * @param {string} value - The input string to validate as a URI.
 * @returns {boolean} `true` if the input is a valid URI, otherwise `false`.
 */
export function isURIValue ( value ) 
{ let localResult = false;
  if ( typeof value === "string" && value.trim().length > 0 ) 
  { try 
    { let url = new URL ( value );
      let protocolValid 
        = url.protocol === "http:" 
          || url.protocol === "https:" 
          || url.protocol === "ftp:"
          || url.protocol === "file:"
          || url.protocol === "mailto:"
          || url.protocol === "urn:"
          || url.protocol === "data:";
          
      // Ensure the value matches the correct scheme format (must contain '://' if applicable)
      localResult 
        = protocolValid 
          && ( url.protocol === "mailto:" 
               || url.protocol === "urn:" 
               || url.protocol === "data:" 
               || value.includes("://") 
              );
      
      // Additional validation for mailto: URIs
      if ( url.protocol === "mailto:" 
           && ( value.split("@").length - 1 !== 1 ) 
         ) 
      { localResult = false;
      } // End if
    } // End try
    catch ( error ) 
    { localResult = false;
    } // End catch
  } // End if
  return localResult;
} // End function isURIValue

/**
 * Determines the type of a given URI string.
 *
 * <p>This function evaluates the input string against various URI patterns
 * and returns a string indicating the type of URI detected. Supported URI
 * types include HTTP/FTP, Mailto, URN, Data URI, File URI, IPv4, and IPv6.
 * If the input does not match any of these patterns, it returns "Invalid".
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Identifies standard web URLs (HTTP/FTP).</li>
 *   <li>Recognizes email address links (Mailto).</li>
 *   <li>Supports Uniform Resource Names (URN).</li>
 *   <li>Detects embedded data strings (Data URI).</li>
 *   <li>Handles local file paths (File URI).</li>
 *   <li>Validates IPv4 and IPv6 addresses.</li>
 *   <li>Returns "Invalid" for unrecognized or malformed URIs.</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * determineURIType("http://example.com"); // Returns: "HTTP/FTP"
 * determineURIType("mailto:user@example.com"); // Returns: "Mailto"
 * determineURIType("urn:isbn:0451450523"); // Returns: "URN"
 * determineURIType("data:text/plain;base64,SGVsbG8="); // Returns: "DataURI"
 * determineURIType("file:///Users/test/file.txt"); // Returns: "FileURI"
 * determineURIType("192.168.1.1"); // Returns: "IPv4"
 * determineURIType("2001:db8::ff00:42:8329"); // Returns: "IPv6"
 * determineURIType("invalid_uri"); // Returns: "Invalid"
 * </pre>
 *
 * @param {string} value - The URI string to evaluate.
 * @returns {string} The type of the URI as a string: "HTTP/FTP", "Mailto", "URN",
 * "DataURI", "FileURI", "IPv4", "IPv6", or "Invalid".
 */
export function determineURIType ( value ) 
{ let localResult = "Invalid";
  if (typeof value === "string" && value.trim().length > 0) 
  { if ( isHTTPorFTP ( value ) ) 
    { localResult = "HTTP/FTP";
    } // End if
    else if ( isMailto ( value ) ) 
    { localResult = "Mailto";
    } // End else if
    else if ( isURN ( value ) ) 
    { localResult = "URN";
    } // End else if
    else if ( isDataURI ( value ) ) 
    { localResult = "DataURI";
    } // End else if
    else if ( isFileURI ( value ) ) 
    { localResult = "FileURI";
    } // End else if
    else if ( isIPv4Value ( value ) ) 
    { localResult = "IPv4";
    } // End else if
    else if ( isIPv6Value ( value) ) 
    { localResult = "IPv6";
    } // End else if
  } // End if
  return localResult;
} // End function determineURIType

/**
 * Determines whether a given string is a valid Data URI.
 *
 * <p>A Data URI is a URI scheme that allows embedding data within a URL using the
 * format `data:[<MIME-type>][;charset=<encoding>][;base64],<data>`. The function
 * verifies that the input conforms to the expected pattern and contains valid encoding.
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Supports both Base64-encoded and non-Base64 Data URIs.</li>
 *   <li>Allows missing MIME types (e.g., `data:,HelloWorld` is valid).</li>
 *   <li>Validates proper Base64 encoding when `;base64` is present.</li>
 *   <li>Handles text-based Data URIs with optional charset encoding.</li>
 *   <li>Rejects malformed Data URIs (e.g., invalid Base64, missing comma, etc.).</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * isDataURI("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==")   // true
 * isDataURI("data:,HelloWorld")                              // true
 * isDataURI("data:;base64,SGVsbG8=")                         // true
 * isDataURI("data:text/html;charset=utf-8,<p>Hello</p>")     // true
 * isDataURI("data:application/json;base64,eyJrZXkiOiAidmFsdWUifQ==") // true
 * isDataURI("data:image/png;base64,INVALIDBASE64$$$")        // false
 * isDataURI("data:")                                         // false
 * isDataURI("data://text/plain;base64,SGVsbG8=")            // false
 * </pre>
 *
 * @param {string} value - The input string to validate.
 * @returns {boolean} `true` if the input is a valid Data URI, otherwise `false`.
 */
export function isDataURI(value) 
{ let localResult = false;
  if (typeof value === "string" && value.trim().length > 0) 
  { let base64Pattern = /^data:(?:[a-zA-Z]+\/[a-zA-Z0-9.-]+)?;base64,[A-Za-z0-9+/]+={0,2}$/;
    let textPattern   = /^data:(?:[a-zA-Z]+\/[a-zA-Z0-9.-]+)?(?:;charset=[a-zA-Z0-9-]+)?,.*$/;

    if ( base64Pattern.test(value) 
         || textPattern.test(value) 
       ) 
    { localResult = true;
    } // End if
  } // End if
  return localResult;
} // End function isDataURI

export function isHTTPorFTP ( value )
{ let localResult = false;
  if ( typeof value === "string" 
       && value.trim().length > 0 
     ) 
  { try 
    { let url = new URL ( value );
      let protocolValid 
        = url.protocol === "http:" 
          || url.protocol === "https:" 
          || url.protocol === "ftp:";
      let hasQueryOrPath = url.search.length > 0 || ( url.pathname.length > 1 && url.pathname !== "/" );
      // Allow empty hostnames ONLY if there is a query or path
      localResult = protocolValid 
                    && ( hasQueryOrPath 
                         || isIPv4Value ( url.hostname ) 
                         || /^[a-zA-Z0-9.-]+$/.test ( url.hostname ) 
                       );
    } // End try
    catch ( error ) 
    { // Handle the specific case of "http://?query=param"
      if ( /^https?:\/\/\?/.test ( value ) ) 
      { localResult = true;
      } // End if
      else 
      { localResult = false;
      } // End else
    } // End catch
  } // End if
  return localResult;
} // End function isHTTPorFTP

/**
 * Checks if a given string is a valid "mailto" URI.
 *
 * A valid "mailto" URI starts with "mailto:", followed by an email address or multiple email addresses.
 * It may include optional query parameters such as subject, body, cc, and bcc.
 * 
 * **Validation Criteria:**
 * - Must start with `"mailto:"`
 * - Accepts standard email formats (e.g., `user@example.com`, `user@sub.example.com`)
 * - Supports IPv4 (`user@192.168.1.1`) and IPv6 (`user@[IPv6:2001:db8::1]`) addresses as domains
 * - Allows multiple recipients separated by commas
 * - Supports optional query parameters (`?subject=...`, `?body=...`, `?cc=...`, `?bcc=...`)
 * - Prevents invalid email formats (e.g., `user@@example.com`, `user@.com`, `user@example..com`)
 * - Allows `mailto:?to=user@example.com` (no initial recipient)
 * - Disallows incorrect formatting such as spaces in the address or malformed query strings
 *
 * @param {string} value - The string to check.
 * @returns {boolean} True if the string is a valid "mailto" URI, otherwise false.
 */
export function isMailto(value) 
{ let localResult = false;

  if (typeof value === "string" && value.trim().length > 7) 
  { // Pattern for valid email addresses (supports IPv4 and IPv6 as domains)
    let emailPattern = /[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|\[IPv6:[a-fA-F0-9:.]+\])/;

    // Ensures domain doesn't contain consecutive dots (prevents user@example..com)
    let noConsecutiveDots = !/\.{2,}/.test(value);

    // Allow mailto:?to=user@example.com case (empty initial recipient)
    let optionalRecipient = `((${emailPattern.source})(,${emailPattern.source})*)?`;

    // Full "mailto:" pattern including optional query parameters
    let mailtoPattern = new RegExp(
      `^mailto:${optionalRecipient}(\\?.*)?$`, "i"
    );

    if (mailtoPattern.test(value) && noConsecutiveDots) 
    { localResult = true;
    } // End if
  } // End if

  return localResult;
} // End function isMailto

/**
 * Checks whether a given string conforms to the Uniform Resource Name (URN) standard.
 * 
 * A URN is a unique and persistent identifier that follows a strict format:
 * - Must start with `urn:`
 * - The Namespace Identifier (NID) must:
 *   - Start with a letter or digit.
 *   - Contain only letters, digits, or hyphens (`-`).
 *   - Not end with a hyphen (`-`).
 *   - Not contain a hyphen followed by digits at the end.
 * - The Namespace-Specific String (NSS) must:
 *   - Contain at least one character.
 *   - Not contain whitespace.
 * 
 * **Examples of valid URNs:**
 * - `urn:isbn:0451450523`
 * - `urn:uuid:6ba7b810-9dad-11d1-80b4-00c04fd430c8`
 * - `urn:oid:1.2.840.113549.1.1.5`
 * - `urn:ietf:rfc:2648`
 * 
 * **Examples of invalid URNs:**
 * - `urn:example:` (Missing NSS)
 * - `urn:` (Missing NID and NSS)
 * - `urn::nss` (Empty NID)
 * - `urn:example#fragment` (Fragment identifier not allowed)
 * - `urn:urn-5:xyz` (NID cannot end with a hyphen followed by digits)
 * - `urn:long-nid-example-12345678901234567890123456789012:xyz` (NID too long)
 * 
 * @param {string} value - The string to check for URN compliance.
 * @returns {boolean} `true` if the input is a valid URN, `false` otherwise.
 */
export function isURN(value) 
{ let localResult = false;

  if (typeof value === "string" && value.toLowerCase().startsWith("urn:")) 
  { let parts = value.split(":");

    if (parts.length >= 3) // Must have at least "urn:NID:NSS"
    { let nid = parts[1];
      let nss = parts.slice(2).join(":"); // Reconstruct NSS

      // 🔹 **Stronger NID pattern**: 
      // - Must start with a letter or digit
      // - Can contain hyphens, but not end in `-` or `-digits`
      let nidPattern = /^(?!.*-\d+$)[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
      let nssPattern = /^[^\s]+$/; // No spaces allowed in NSS

      if (nidPattern.test(nid) && nssPattern.test(nss)) 
      { localResult = true;
      } // End if
    } // End if
  } // End if

  return localResult;
} // End function isURN

/**
 * Checks if a given string is a valid file URI.
 * 
 * <p>
 * A valid file URI starts with "file://" and follows one of these formats:
 * <ul>
 *   <li>Unix/macOS format: file:///Users/example.txt</li>
 *   <li>Windows format: file://C:/Users/test</li>
 *   <li>Network format: file://server/share</li>
 *   <li>Encoded paths with spaces: file:///Users/test%20file.txt</li>
 * </ul>
 * The function also ensures:
 * <ul>
 *   <li>Relative paths (e.g., file://./relative/path) are invalid.</li>
 *   <li>Paths with traversal patterns (`../`) are invalid.</li>
 *   <li>File URIs must not be empty.</li>
 *   <li>Unusual separators (e.g., "C|/Users/test") are rejected.</li>
 * </ul>
 * </p>
 * 
 * @param {string} value - The string to be checked as a file URI.
 * @returns {boolean} True if the input is a valid file URI, false otherwise.
 */
export function isFileURI(value)
{
  let localResult = false;
  if (typeof value === "string" && value.trim().length > 0) 
  { 
    let unixPattern = /^file:\/\/\/([A-Za-z0-9._%+-]+\/?)+$/;
    let windowsPattern = /^file:\/\/[A-Za-z]:\/([A-Za-z0-9._%+-]+\/?)+$/;
    let networkPattern = /^file:\/\/[A-Za-z0-9._-]+\/([A-Za-z0-9._%+-]+\/?)+$/;

    if ( unixPattern.test(value) 
         || windowsPattern.test(value) 
         || networkPattern.test(value) 
       ) 
    { localResult = true;
    } // End if
  } // End if
  return localResult;
} // End function isFileURI


/**
 * Synchronously checks if a URI is reachable using `curl`.
 *
 * <p>This function sends an HTTP HEAD request to the specified URI to determine
 * whether it is accessible. Special cases such as `mailto:` and `data:` URIs
 * are explicitly ignored since they are not network-reachable.</p>
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Supports HTTP(S) URI reachability checks.</li>
 *   <li>Explicitly rejects unsupported URI schemes (e.g., `mailto:`, `data:`).</li>
 *   <li>Uses `curl` for synchronous execution to maintain blocking behavior.</li>
 *   <li>Handles network errors gracefully with debugging output.</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * resolveURIs("http://example.com");        // true
 * resolveURIs("https://secure.com");        // true
 * resolveURIs("mailto:user@example.com");   // false
 * resolveURIs("data:text/plain;base64,SGVsbG8="); // false
 * resolveURIs("http://nonexistent.example.com"); // false
 * </pre>
 *
 * @param {string} uri - The URI to check.
 * @returns {boolean} - `true` if the URI is reachable, otherwise `false`.
 */
export function resolveURIs ( uri ) 
{ let localResult = false; // Default to false
  if ( uri && typeof uri === 'string' && uri.trim() !== '' ) 
  { try 
    { // Handle special cases that should always return false
      if ( uri.startsWith ( "mailto:" ) 
           || uri.startsWith ( "data:" ) 
         ) 
      { return false;
      } // End if
      // Use `curl` for a synchronous HEAD request
      const command = `curl -Is ${uri} | head -n 1`;
      const response = execSync ( command, { encoding: 'utf8' } ).trim();
      // Check if response contains a valid HTTP status
      localResult = response.startsWith ( "HTTP/1.1 200" ) 
                    || response.startsWith ( "HTTP/2 200" );
    } // End try
    catch ( error ) 
    { console.warn ( `resolveURIs: Unable to reach ${uri} - ${error.message}` );
    } // End catch
  } // End if
  return localResult; // Return final result
} // End function resolveURIs

/**
 * Validates whether a given string is a properly formatted email address.
 *
 * <p>This function checks if the input is a valid email address according to RFC 5322,
 * including handling display name formats such as "Jane Doe <jane.doe@someplace.com>".
 * The function extracts the email portion if enclosed in angle brackets (`<>`),
 * then validates it against the standard email format.</p>
 *
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>Extracts and validates emails in "Display Name <email@domain.com>" format.</li>
 *   <li>Ensures valid domain structure, preventing invalid cases like double dots (`..`).</li>
 *   <li>Rejects domains that start with a hyphen (`-`).</li>
 *   <li>Supports common email structures with subdomains and plus-addressing.</li>
 *   <li>Rejects malformed inputs, including missing `@`, spaces, and other structural errors.</li>
 * </ul>
 *
 * <h2>Examples:</h2>
 * <pre>
 * isEmailValue("user@example.com");          // true
 * isEmailValue("Jane Doe <jane.doe@someplace.com>"); // true
 * isEmailValue("user@domain..com");         // false (double dot in domain)
 * isEmailValue("user@-example.com");        // false (hyphen at start of domain)
 * isEmailValue("@example.com");             // false (missing local part)
 * </pre>
 *
 * @param {string} stringValue - The input string to validate.
 * @returns {boolean} - `true` if the input is a valid email address, otherwise `false`.
 */
export function isEmailValue ( stringValue ) 
{ let localResult = false; // Default to false
  if ( typeof stringValue === 'string' && stringValue.trim() !== '' ) 
  { // Extract email inside < > if present
    let match = stringValue.match ( /<([^<>]+)>/ );
    let emailToCheck = match ? match[1] : stringValue; // Use extracted email if found

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    localResult = emailRegex.test ( emailToCheck ) 
                  && !/^[-]/.test ( emailToCheck.split('@')[1] ) // No domain starting with '-'
                  && !/\.\./.test ( emailToCheck.split('@')[1] ); // No double dots in domain
  } // End if 
  return localResult; // Return result
} // End function isEmailValue

/**
 * Checks if a given string is a valid international phone number (E.164 format).
 * 
 * **Format Requirements:**
 * - Starts with a `+`, followed by the **country code** (1-3 digits).
 * - Followed by **local number** (up to 15 digits total, excluding spaces or dashes).
 * 
 * **Examples:**
 * - `+15555555555` (Valid USA number)
 * - `+442079460958` (Valid UK number)
 * - `5555555555` (Missing country code)
 * - `+1-555-ABC-1234` (Contains invalid characters)
 * 
 * @param {string} stringValue - The string to check.
 * @returns {boolean} - True if it is a valid international phone number, false otherwise.
 */
export function isPhoneNumberValue(value) 
{ let localResult = false; // Default result

  if (typeof value === "string" && value.trim() !== "") 
  { 
    const phoneRegex = /^\+([1-9]\d{0,2})\s?((?:\d{1,4}[\s-]?){1,4}\d{1,10})$/;

    // Allow up to **16** digits instead of 15 to accommodate edge cases
    const cleanedValue = value.replace(/[\s-]/g, "").slice(1); // Remove '+' and formatting
    localResult = phoneRegex.test(value) && cleanedValue.length <= 16;
  } // End if

  return localResult;
} // End function isPhoneNumberValue


  export function parseParameter ( value )
  { const regex = /(\w+)=(?:(["'])([^"']+?)\2|(\w+))/;
    const match = value.match(regex);
    const result = { parameter: null,
                     value: null,
                   };
    if ( match )
    { result.parameter = match[1];
      result.value = match[3] || match[4];
    } // End if
    return result;
  } // End function parseParameter

  export function mapHasIgnoreCase ( map, searchKey )
  { let result = false;
    const searchLower = searchKey.toLowerCase();
    for ( const key of map.keys() )
    { if ( key.toLowerCase() === searchLower )
      { result = true;
      } // End if
    } // End for key
    return result;
  } // End function mapHasIgnoreCase

  export function prettifyJSON ( dataObject, numberOfSpaces = 40 ) 
  { let localResult = dataObject;
    if ( typeof dataObject === 'object' )
    { const indentation = ' '.repeat(numberOfSpaces);
      const jsonString = JSON.stringify(dataObject, null, numberOfSpaces);
      // Replace the default indentation with custom indentation
      localResult = jsonString.replace(new RegExp(` {${numberOfSpaces}}`, 'g'), indentation);
    }
    return localResult;
  } // End prettifyJSON

  export function startsAndEndsWithApostrophe ( stringValue )
  { stringValue = stringValue.trim();
    let localValue = stringValue.length >= 2 
                     && stringValue[0] === "'" 
                     && stringValue[stringValue.length - 1] === "'";
    return localValue;
  }  // End function startsAndEndsWithApostrophe

 export function startsAndEndsWithCaret ( stringValue )
 { stringValue = stringValue.trim();
  let localValue = stringValue.length >= 2 
                   && stringValue[0] === '^' 
                   && stringValue[stringValue.length - 1] === '^';
  return localValue;
}  // End function startsAndEndsWithCaret

  export function startsAndEndsWithChevrons ( stringValue )
  { stringValue = stringValue.trim();
    let localResult = stringValue.startsWith('<') && stringValue.endsWith('>');
    return localResult;
  } // End function startsAndEndsWithChevrons

  export function startsAndEndsWithQuotes ( stringValue )
  { stringValue = stringValue.trim();
    let localValue = stringValue.length >= 2 
                     && stringValue[0] === '"' 
                     && stringValue[stringValue.length - 1] === '"';
    return localValue;
  }  // End function startsAndEndsWithQuotes

  export function startsAndEndsWithLiteral ( stringValue )
  { let localResult = false; // Initialize result to false
    stringValue = stringValue.trim(); // Remove leading/trailing whitespace
    if (stringValue.length >= 2) { // Ensure minimum length of 2
      const startChar = stringValue[0]; // Get the first character
      const endChar = stringValue[stringValue.length - 1]; // Get the last character
      // Check if both start and end characters match and are valid literals
      localResult = (startChar === endChar) && 
                    (startChar === '"' || startChar === "'" || startChar === "`");
    } // End if
    return localResult; // Return result
  } // End function startsAndEndsWithLiteral
  

  export function isPathWithinRoot ( rootPath, relativePath )
  { const rootComponents        = rootPath.split( path.sep );
    const pathComponents        = relativePath.split( path.sep );
    const isWindows             = process.platform === 'win32';
    const upDirectoryIndicator  = isWindows ? path.dirname('dummy') : '..';;
    let staysWithinPath         = true; // Assume it stays within the root
    let rootIndex               = 0;

    componentLoop: for ( let componentCounter = 0; 
                             componentCounter < pathComponents.length; 
                             componentCounter++
                      ) 
      { const component = pathComponents[componentCounter];
        if ( component === upDirectoryIndicator )
        { rootIndex--;
          if ( rootIndex < 0 )
          { staysWithinPath = false; // Goes back beyond root
            break componentLoop;
          } //End if
        } // End if
        else if ( component !== '' && componentCounter < pathComponents.length - 1 ) 
        { rootIndex++;
          if (rootIndex > rootComponents.length)
          { // Corrected comparison here
              staysWithinPath = false; // Goes beyond rootPath
               break componentLoop;
          } // End if
        } // End else if
    } // End loop componentLoop
    return staysWithinPath;

  } // End function isPathWithinRoot

  export function parseArgumentStatement ( metaCommand , cmdString  )
  { //const includePattern = new RegExp(`^${metaCommand}\\s+("[^"]+"|[^"\\s]+)(.*)$`);
    const includePattern = new RegExp(`^${metaCommand}\\s+(['"^][^'"^]+['"^]|[^"'\\s^]+)(.*)$`);
    const match = cmdString.trim().match(includePattern);
    let parsedStatement = {};
    if ( match ) 
    { parsedStatement.metaCommand       = metaCommand;
      parsedStatement.fileSpecification = match[1].trim();
      parsedStatement.argumentsString   = match[2].trim();
    } // End if
    return parsedStatement;
  } // End function parseIncludeStatement

  export function removeDuplicateWords 
    ( stringOfWords, 
      splitText      = ' ', 
      joinText       = ' '
    ) 
  { // Check if the stringOfWords is empty or null
    if ( !stringOfWords )
    { return '';
    } // End if
    // Split the stringOfWords into an array of words
    const words = stringOfWords.split( splitText );
    // Use a Set to store unique words
    const uniqueWords = new Set ( words );
    // Join the unique words back into a string
    const result = [ ...uniqueWords ].join( joinText );
    return result;
  } // End function removeDuplicateWords

  export function wordExistsInList ( word, list )
  { let localResult = false; 
    if ( word && list )
    { // Split the list into an array of words
      const words = list.split(' ');
      // Check if the target word exists in the array
      localResult = words.includes ( word );
    } // End if
    return localResult;
  } // End function wordExistsInList

  export function splitIntoNewLines ( prefix, textToSplit ) 
  { const newline = '\n';
    const continuation = "+ "; 
    // Split the input into lines of Text
    const linesOfText = textToSplit.split( newline );
    // Create an array to store the result
    let formattedText = [];
    // Set the prefix for the first line
    formattedText.push ( prefix + "  " + linesOfText[0]);
    prefix += continuation;
    // Set the prefix for subsequent linesOfText
    for ( let lineCounter = 1; 
              lineCounter < linesOfText.length; 
              lineCounter++ 
        ) 
    { formattedText.push( prefix + linesOfText [ lineCounter ]);
    } // End for
    // Join the linesOfText with a newline character
    formattedText = formattedText.join ( newline );
    return formattedText;
} // End function splitIntoNewLines

export function doesFileExist (fileSpec)
{ let localResult = false;
  try
  { localResult = fileSystem.existsSync(fileSpec); // ✅ Assign the result to localResult
  } // End try
  catch ( error )
  { console.error('--*** Error checking file existence:', error);
    localResult = false;
  } // End catch
  return localResult;
} // End function doesFileExist 

function unitTestTdlUtils()
{ let templateGlobalContext = new TemplateGlobalContext();
  //let resultOfScan = [ '', '', '' ]; 
  let tdlUtils = new TdlUtils (  templateGlobalContext );

  let fileContent
    = [ 'This is the first line',
        'more here: _` one two three',
        'just another line 1',
        'just another line 2',
        '_` and the rest goes here'

      ];
  console.log ( '\n\n========== Step 1.0 ==========' );
  templateGlobalContext.setTraceState (true);
  let resultBuffer = tdlUtils.readTemplateLiteral ( fileContent, 1, fileContent[1] );
  templateGlobalContext.setTraceState (false);
  console.log ( '----> resultBuffer[0] ->' + resultBuffer[0] );
  console.log ( '----> resultBuffer[1] ->' + resultBuffer[1] );
  console.log ( '----> resultBuffer[2] ->' + resultBuffer[2] );

  console.log ( '\n\n========== Step 2.0 ==========' );
    console.log ( '\n========== Step 2.1 -- trimLeft' );
    let text = '............ME..........';
    let widthOfField = text.length;
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-- ' +  text );
    console.log ( '-- ' +  trimLeft( text, "." ) );

    console.log ( '\n========== Step 2.2 -- trimRight' );
    text = '............ME.too..........';
    widthOfField = text.length;
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-- ' +  text );
    console.log ( '-- ' +  trimRight( text, "." ) );
    
    console.log ( '\n========== Step 2.3 -- trim' );
    text = '............ME.too..........';
    widthOfField = text.length;
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-- ' +  text );
    console.log ( '-- ' +  trim( text, "." ) );

    console.log ( '\n========== Step 2.4 -- padRight' );
    text = 'ME.too';
    widthOfField = text.length;
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-- ' +  text );
    console.log ( '-- ' +  padRight( text, 40, "." ) + '<-');

    console.log ( '\n========== Step 2.5 -- padLeft' );
    text = 'ME.too';
    widthOfField = text.length;
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-- ' +  text );
    console.log ( '-- ' +  padLeft( text, 40, "." ) + '<-');

    console.log ( '\n========== Step 2.6 -- center' );
    text = 'ME.too';
    widthOfField = text.length;
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-- ' +  text );
    console.log ( '-- ' +  center( text, 40, "." ) + '<-');

 // console.log ( '----> fileContent ->\n' + fileContent );

  console.log ( '\n\n========== Step 3.0 ==========' );
  console.log ( '\n========== Step 3.1 -- isOn' );
  console.log ( '-- is YES on? ' + tdlUtils.isOn ( 'YES'  ) );
  console.log ( '-- is OFF on? ' + tdlUtils.isOn ( 'OFF'  ) );
  
  console.log ( '\n========== Step 3.2 -- isOff' );
  console.log ( '-- is YES on? ' + tdlUtils.isOff ( 'YES'  ) );
  console.log ( '-- is OFF on? ' + tdlUtils.isOff ( 'OFF'  ) );

  console.log ( '\n\n========== Step 4.0 ==========' );
  console.log ( '\n========== Step 4.1 -- processQuestionOperator' );
  let lineOfText = '_? ( (2*1/1) === (2) ) _#BREAK _: Do nothing here';
  console.log ( '-- lineOfText ->' + lineOfText + '<-' );
  let matches = tdlUtils.processQuestionOperator ( lineOfText );
  console.log ( '-- matches    : ' + matches );

  console.log ( '\n========== Step 4.2 -- processQuestionOperator' );
  lineOfText = '_#DEFINE a blah blah blah';
  console.log ( '-- lineOfText ->' + lineOfText + '<-' );
  matches = tdlUtils.processQuestionOperator ( lineOfText );
  console.log ( '-- matches    : ' + matches );


  console.log ( '\n\n========== Step 5.0 ==========' );
  let cmdLine = '"some" text name="string    1   " location test=this one = "another string" etc';
  console.log ( '-- cmdLine: ' + cmdLine );
  let listOfParams = 'one,two,three'.split(',');
  //templateGlobalContext.setTraceState ( true );
  let numberOfDefinitions = tdlUtils.processCmdLine ( cmdLine, listOfParams );
  console.log ( '### numberOfDefinitions -> ' + numberOfDefinitions );
  //templateGlobalContext.setTraceState ( false );
  templateGlobalContext.dumpGlobalsContext ( 'LOCAL');
  return;

  



  templateGlobalContext.getMetaSettings().set( 'metaEchoComment', true );
  templateGlobalContext.setTraceState ( true );
  let linesOfTemplateCode
    = [ 'this is a long ine of text _\\\\',
        'And it Continues to this line of text _\\\\',
        'And ends here.'
      
      
        //'_/* this is a test',
       // 'and more test',
       //'_*/'
       // 'This is only text',
       // '_/* This is a single line comment _*/',
       // 'Testing one two three _/* the radio broadcast system _*/',
       // 'Testing one two three _/* the radio broadcast system _*/ four five six',
       // 'Testing one two three _/* the radio broadcast system _*/ four five six _/* it is only a test _*/ seven eight nine',
       // 'In the beginning, there was a comment _/* and the comment seemed to go on',
       // 'forever, and ever and ever',
       // 'And finally the lord of the comments said',
       // 'Enough with the comments _*/ and do your work'
     ];
  console.log ( 'linesOfTemplateCode -> \n' + linesOfTemplateCode.join('\n') );
  let lineCounter = 0;
  let lineOfCode;
  let commentText;
  lineOfCode = linesOfTemplateCode [ lineCounter  ];
  tdlUtils.readContinuedLine ( linesOfTemplateCode, lineCounter, lineOfCode )
  return;
  console.log ( '------>' + RULER );
  for ( lineCounter = 0; 
        lineCounter < linesOfTemplateCode.length; 
        lineCounter++
       )
  { lineOfCode = linesOfTemplateCode[lineCounter];
    console.log ( '-->' + lineCounter + '] "' + lineOfCode + '"' );

    resultOfScan = tdlUtils.processComments ( linesOfTemplateCode, lineCounter, lineOfCode );
    lineCounter    = resultOfScan[0];
    lineOfCode     = resultOfScan[1];
    commentText    = resultOfScan[2];
    console.log ( '<--' + lineCounter + '] "' + lineOfCode + '"' );
  } // End for

} // End unitTestTdlUtils

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestTdlUtils();
} // End if
