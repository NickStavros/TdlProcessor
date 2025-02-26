/**
 * File: HostCommands.js
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
 * @class HostCommands
 * @description Processes the host commands encountered in a template.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext           from './TemplateGlobalContext.js';
import * as os                         from 'os';
import * as path                       from 'path';
import { generateRuler,
         compressText,
         eliminateNonAlphanumerics,
         toValidNameChars,
         center,
         definePseudoElements,
         padLeft,
         padRight,
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
         isOn,
         isOff,
         isOnOrOff,
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
       }                               from './TdlUtils.js';

//===== Class Definition =====
export default class HostCommands
  { //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
     #templateGlobalContext;
    
    //===== Constructors 
    constructor ( templateGlobalContext )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to HostCommands, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      this.#templateGlobalContext = templateGlobalContext;
      this.#templateGlobalContext.consoleTrace ( 'Starting HostCommands Constructor' );
      this.#templateGlobalContext.consoleTrace (  'Finishing HostCommands Constructor' );
    } // End constructor
    
  execute ( expression, reportErrors=true )
  { this.#templateGlobalContext.consoleTrace ( 'Starting execute -> ' + expression );
    let localResult = expression;
    let code = 'return ' + expression;
    try
    { const dynamicFunction = new Function('os', 'path', code);
      localResult = dynamicFunction ( os, path );
    } // End try
    catch ( message )
    { if ( reportErrors )
      { console.log ( '--*** Expression is not executable, Expression ignored: "' + expression + '"' );
        console.log ( '--*** ' + message );
      } // end if report errors
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing execute -> ' + localResult );
    return localResult;
  } // End function execute

  executeHostCmd ( lineOfText )
  { this.#templateGlobalContext.consoleTrace ( 'Starting executeHostCmd -> ' + lineOfText );
    let metaHostCmd               = this.#templateGlobalContext.getMetaSettings ().get( 'metaHostCmd' );
    if ( lineOfText ) 
    { let startOfHostCmdLocation         = lineOfText.indexOf ( metaHostCmd );
      let endOfHostCmd                   = lineOfText.indexOf ( metaHostCmd, startOfHostCmdLocation+1 );
      for ( let attempt = 0; 
                attempt < MAX_ATTEMPTS 
                  && startOfHostCmdLocation >= 0 
                  && endOfHostCmd >=0 ;
                attempt++ 
          )
      { while ( startOfHostCmdLocation >= 0 )
        { //let endOfHostCmd = lineOfText.indexOf ( metaHostCmd, startOfHostCmdLocation );
          let hostCmd = lineOfText.substring ( startOfHostCmdLocation + metaHostCmd.length , endOfHostCmd );
          let hostCmdResult = this.execute ( hostCmd );
          lineOfText = lineOfText.replace ( metaHostCmd + hostCmd + metaHostCmd,  hostCmdResult  );
          // let variableValue =  this.#templateGlobalContext.get ( variableName );
          if ( hostCmd )
          { // lineOfText = this.replaceVariableValue (  lineOfText, startOfHostCmdLocation, variableName, variableValue );
            startOfHostCmdLocation = lineOfText.indexOf ( metaHostCmd);
            endOfHostCmd           = lineOfText.indexOf ( metaHostCmd, startOfHostCmdLocation+1 );
          } // End if
          else
          { startOfHostCmdLocation = lineOfText.indexOf ( metaHostCmd, ( startOfHostCmdLocation + variableName.length ) );
          } // End Else
          if ( startOfHostCmdLocation ===  endOfHostCmd ) 
          { break;
          } // End if 
        } // End while
      } // End for block
      if ( endOfHostCmd < 0 && startOfHostCmdLocation >=0 )
          { console.log ( '--*** Warning, metaHostCmd not properly terminated. Skipping the command.' );
          } // End if
    } // End block
    this.#templateGlobalContext.consoleTrace ( 'Finishing executeHostCmd -> ' + lineOfText );
    return lineOfText;
  } // End function executeHostCmd

  } // End class HostCommands

  function execute ( expression )
    { return new Function ( 'return ' + expression)();
    } // End function execute

  /* In order to make the following commands visible to the execute command without 
     having to add a namespace, the following functions are individually exported
     from the TdlUtils.js file and then assigned to a global scope.
  */
    global.generateRuler               = generateRuler;
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
    
  function unitTestHostCommands()
  { let hostCommands = new HostCommands();
    let localResult;
    let hostCommandText;
    let text = 'Trust Me';
    let widthOfField = text.length;
    
    hostCommandText = 'center("' + text + '",' + widthOfField + ', "." )';
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( 'text :\n-- ' + text );
    localResult = execute (  hostCommandText )
    console.log ( '"' + text + '" centered in ' + widthOfField +'\n-- ' + localResult + '<-' );

    widthOfField = widthOfField - 2;
    hostCommandText = 'center("' + text + '",' + widthOfField + ', "." )';

    console.log ( 'hostCommandText : ' + hostCommandText );
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '"' + text + '" centered in ' + widthOfField +'\n-- ' + localResult + '<-' );

    widthOfField = 30;
    hostCommandText = 'center("' + text + '",' + widthOfField + ', "." )';
    console.log ( 'hostCommandText : ' + hostCommandText );
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '"' + text + '" centered in ' + widthOfField +'\n-- ' + localResult + '<-' );

    console.log ( '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' );
    console.log ( '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' );
    text = localResult;
    console.log ( '@@@@@ text ->' + text + '<-' );
    widthOfField = 30;
    hostCommandText = 'trimLeft("' + text + '", ".", ' + widthOfField + ')';
    console.log ( 'hostCommandText : ' + hostCommandText );
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '"' + text + '" centered in ' + widthOfField +'\n-- ' + localResult + '<-' );
    
    widthOfField = 5;
    hostCommandText = 'trimLeft("' + text + '", "." )';
    console.log ( 'hostCommandText : ' + hostCommandText );
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '"' + text + '" centered in ' + widthOfField +'\n-- ' + localResult + '<-' );

   text = '............ME..........';
   widthOfField = text.length;
    hostCommandText = 'trimLeft("' + text + '", "." )';
    console.log ( 'hostCommandText : ' + hostCommandText );
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '"' + text + '" trimmed in ' + widthOfField +'\n-- ' + localResult + '<-' );

    text = '............ME..........';
   widthOfField = text.length;
    hostCommandText = 'trimRight("' + text + '", "." )';
    console.log ( 'hostCommandText : ' + hostCommandText );
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '"' + text + '" trimmed in ' + widthOfField +'\n-- ' + localResult + '<-' );

    text = '............ME..........';
    widthOfField = text.length;
     hostCommandText = 'trim("' + text + '", "." )';
     console.log ( 'hostCommandText : ' + hostCommandText );
     localResult = execute (  hostCommandText )
     console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
     console.log ( '"' + text + '" trimmed in ' + widthOfField +'\n-- ' + localResult + '<-' );

    console.log ( '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' );
    console.log ( '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' );


    text = '        this  is    \\n'+
           'a test  and it\'s over     ';
    console.log ( '-->' + text + '<-' );
    hostCommandText = 'compressText("' + text +'" )';
    localResult = execute (  hostCommandText );
    console.log ( '===== compressText ' );
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-->' + localResult + '<-');

    console.log ( '===== toUpperCamelCase ' );
    hostCommandText = 'toUpperCamelCase("' + text +'" )';
    localResult = execute (  hostCommandText )
    console.log ( '-- 0....:....1....:....2....:....3....:....4....:....5....:....6' );
    console.log ( '-->' + localResult + '<-');
    console.log ( '-->' + toValidNameChars ( localResult ) );

    text = "        this  is    \n"+
           "a test\t\t\n\r  and it\'s over     ";
    
    let whiteSpaceRegEx = /[\s\r\n\t]+/gm
    localResult = text.replace (whiteSpaceRegEx, ' ' );
    console.log ( '-->' + localResult + '<-');

    let str = "Hello\n" +
      "there    stranger!";

    console.log ( '-->' + str.replace(whiteSpaceRegEx, "") );

    let lineOfText = 'This is a place for a _<"This is the Text".length _< my name _<"This is the Text".toUpperCase()  _< some';
    console.log ( '============ Test 1.0\n'+ RULER );
    console.log ( 'LineOfText ->\n' + lineOfText );
    lineOfText = hostCommands.executeHostCmd ( lineOfText );
    console.log ( 'LineOfText ->\n' + lineOfText );
  
    text = 'Governing Board Member';
    console.log ( 'toTitleCase      -> ' + toTitleCase       ( text ) );
    console.log ( 'toLowerCase      -> ' + toLowerCase       ( text ) );
    console.log ( 'toUpperCase      -> ' + toUpperCase       ( text ) );
    console.log ( 'toUpperSnakeCase -> ' + toUpperSnakeCase  ( text ) );
    console.log ( 'toLowerSnakeCase -> ' + toLowerSnakeCase  ( text ) );
    console.log ( 'toTitleSnakeCase -> ' + toTitleSnakeCase  ( text ) );
    console.log ( 'toUpperCamelCase -> ' + toUpperCamelCase  ( text ) );
    console.log ( 'toLowerCamelCase -> ' + toLowerCamelCase  ( text ) );



  } // End function unitTestHostCommands

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestHostCommands();
} // End if
