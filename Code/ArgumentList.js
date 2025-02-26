/**
 * File: Argument.js
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
 * @class ArgumentList
 * @description Parses a string of text as a collection of argument strings.
 * Each argument string can be one of the following format:
 *   * argument
 *   * argument=value
 *   * argument="value with blanks"
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import * as tdlUtils         from './TdlUtils.js';
import TemplateGlobalContext from './TemplateGlobalContext.js';
import { stringAttributeName, 
         numericAttributeName, 
         booleanAttributeName, 
         parameterNames 
       }                     from './WordWrap.js';

       //===== Class Definition =====
export default class ArgumentList
{ //===== Private
  /**
   * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
   * @type { TemplateGlobalContext }
   * @private
   */
  #templateGlobalContext;
  /**
   * contains the original string parsed into arguments
   * @type { string }
   * @private
   */
  #inputString;
  #parameterNames;
  #parsedArgumentList;
  #parsedArgumentStrings;
  #nonArgumentValues;
  #argumentValues;
  #mergedArgumentValues;
  #existingMappedValues;
  #foundParameterNames;
  #notFoundParameterNames;
  #classInstance;
  #missingValue ; 
  #positionalPrefix; 

  //===== Constructors 
  constructor ( templateGlobalContext )
  { if ( ( !templateGlobalContext ) )
    { console.log ( '--*** No TemplateGlobalContext provided to ArgumentList, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if (
    templateGlobalContext.consoleTrace ( 'Starting ArgumentList Constructor' );
    this.#templateGlobalContext = templateGlobalContext;
    this.setupForDefault();
    templateGlobalContext.consoleTrace ( 'Finishing ArgumentList Constructor' );
  } // End constructor ArgumentLists

  setupForDefault()
  { this.#parsedArgumentList = [];
    this.#missingValue       = '';
    this.#positionalPrefix   = '';
  } // End function setupForDefault

  getParsedArgumentList()
  { return this.#parsedArgumentList;
  } // End function 

  getArgumentValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getArgumentValues' );
    return this.#argumentValues;
  } // End function getArgumentValues

  setArgumentValues ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setArgumentValues' );
    this.#argumentValues = newValue;
  } // End function setArgumentValues

  getExistingMappedValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getExistingMappedValues' );
    return this.#existingMappedValues;
  } // End function getExistingMappedValues

  setExistingMappedValues ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setExistingMappedValues' );
  this.#existingMappedValues = newValue;
  } // End function setExistingMappedValues

  getFoundParameterNames ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getFoundParameterNames' );
    return this.#foundParameterNames;
  } // End function getFoundParameterNames

  setFoundParameterNames ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setFoundParameterNames' );
  this.#foundParameterNames = newValue;
  } // End function setFoundParameterNames

  getNonArgumentValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getNonArgumentValues' );
    return this.#nonArgumentValues;
  } // End function getNonArgumentValues

  setNonArgumentValues ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setNonArgumentValues' );
    this.#nonArgumentValues = newValue;
  } // End function setNonArgumentValues

  getMergedValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getMergedValues' );
    return this.#mergedArgumentValues;
  } // End function getMergedValues

  setMergedValues ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setMergedValues' );
    this.#mergedArgumentValues = newValue;
  } // End function setMergedValues

  getNotFoundParameterNames ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getNotFoundParameterNames' );
    return this.#notFoundParameterNames;
  } // End function getNotFoundParameterNames

  setNotFoundParameterNames ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setNotFoundParameterNames' );
  this.#notFoundParameterNames = newValue;
  } // End function setNotFoundParameterNames

  getParameterNames ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getParameterNames' );
    return this.#parameterNames;
  } // End function getParameterNames

  setParameterNames ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setParameterNames' );
    this.#parameterNames = newValue;
  } // End function setParameterNames

  getParsedArgumentList ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getParsedArgumentList' );
    return this.#parsedArgumentList;
  } // End function getParsedArgumentList

  setParsedArgumentList ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setParsedArgumentList' );
    this.#parsedArgumentList = newValue;
  } // End function setParsedArgumentList

  getParsedArgumentStrings ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getParsedArgumentStrings' );
    return this.#parsedArgumentStrings;
  } // End function getParsedArgumentStrings

  setParsedArgumentStrings ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setParsedArgumentStrings' );
    this.#parsedArgumentStrings = newValue;
  } // End function setParsedArgumentStrings

  getClassInstance ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getClassInstance' );
    return this.#classInstance;
  } // End function getClassInstance

  getClassInstanceName ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getClassInstanceName' );
    return this.#classInstance.constructor.name;
  } // End function getClassInstanceName

  setClassInstance ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setClassInstance' );
    this.#classInstance = newValue;
  } // End function setClassInstance

  getMissingValue ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getMissingValue' );
    return this.#missingValue;
  } // End function getMissingValue

  setMissingValue ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setMissingValue' );
    this.#missingValue = newValue;
  } // End function setMissingValue

  getPositionalPrefix ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getPositionalPrefix' );
    return this.#positionalPrefix;
  } // End function getPositionalPrefix

  setPositionalPrefix ( newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.setPositionalPrefix' );
    this.#positionalPrefix = newValue;
  } // End function setPositionalPrefix

  getInputString ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Executing ArgumentList.getInputString' );
    return this.#inputString;
  } // End function getInputString

  //----- parseArgumentString 
  parseArgumentString
  ( parameters, 
    inputString
  )
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.parseArgumentString' );
    // Initialize the parsedArguments
    this.#inputString            = inputString;
    this.#parameterNames         = parameters;
    this.#parsedArgumentStrings  = [];
    this.#parsedArgumentList     = [];
    this.#foundParameterNames    = [];
    this.#argumentValues         = [];
    this.#nonArgumentValues      = [];
    this.#notFoundParameterNames = [];
    this.#existingMappedValues   = [];
    
    // Check if inputString is defined and not null
    if (inputString === undefined || inputString === null)
    { inputString = ''; // Set inputString to an empty string
    } // End if
    this.#inputString = inputString;
    this.#parsedArgumentList.push( [ this.#positionalPrefix + "0", inputString ] );
    
    // Split the input string into an array of words
    //console.log('@@@@ inputString : ' + inputString);
    const paramRegExp           = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;
    this.#parsedArgumentStrings = inputString.match(paramRegExp);

    // Create a map to store parameter-value pairs
    const paramMap = new Map();
    
    // Iterate through the words in the input string
    for ( let argumentCounter = 0; 
              argumentCounter < this.#parsedArgumentStrings.length; 
              argumentCounter++ 
        )
    { const argument = this.#parsedArgumentStrings [ argumentCounter ].trim();
      if ( argument === "" )
      { // Skip empty argument
        continue;
      } // End if
      // Check if the argument is in the format "parameter=value"
      let key         = argument;
      let value       = '';
      let keyOrdinal  = 1;
      const regex     = /(\w+)=('[^']*'|"[^"]*"|\S+)/g;
      let match;
      
      while ( ( match = regex.exec ( argument ) ) !== null ) 
      { key     = match[1] || keyOrdinal++;
        value   = match[2] || '';             // Use an empty string if value is not present
        value   = value.replace(/["']/g, ''); // Remove quotes from value
      } // End while

      const wordsInKey = key.split(/\s+/);
      if ( wordsInKey.length > 1 )
      { value  = key.replace(/["']/g, '');    // Remove quotes from value;
        key    = keyOrdinal++;
        this.#parsedArgumentList.push ( [key.toString(), value ] );
      } // End if
      else
      { key = tdlUtils.trimRight ( key, '=' );
      } // End else
      key = key.toString().trim();
      if ( key.length > 0 )
      { paramMap.set ( key, value );
      } // End if
    } // End for argumentCounter
    this.#parsedArgumentList = [...paramMap];
    // Extract values for the specified parameters and add extra information
    for ( const parameter of parameters ) 
    { // Convert parameter name to lowercase
      const key = parameter.toLowerCase(); 
      let value = '';
      if ( tdlUtils.mapHasIgnoreCase ( paramMap,  key ) ) 
      { value = paramMap.get ( key );
        this.#foundParameterNames.push ( key );
        this.#argumentValues.push ( [ key, value ] );
      } // End if
      else 
      { // If parameter is not found, add a placeholder value
        this.#notFoundParameterNames.push ( [ key, value ] );
      } // End else
    } // End for parameter
    // Add the original input string and its index for reference

    this.findExistingMappedValues();
    this.determineArgumentValues();
    this.determineNonArgumentValues();
    this.mergeArgumentValues();

    // Extract all quoted strings and non-space sequences
    
    // Return the parsedArguments
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.parseArgumentString' );

    return this.#parsedArgumentList;
  } // End function parseArgumentString

  mergeArgumentValues ( ) 
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.mergeArgumentValues' );
    // Create a new map to store the merged values
    const mergedValues = new Map ( this.#existingMappedValues );
    //for ( let entry of this.#parsedArgumentList )
    for ( let entry of this.#parsedArgumentList )
    { let parameterEntry = tdlUtils.parseParameter ( entry[1] );
      const keyFromResults  = entry[0];
      const valueFromResult = entry[1];
      if ( ! tdlUtils.isNull ( keyFromResults ) && tdlUtils.mapHasIgnoreCase ( mergedValues, keyFromResults ) )
      { const coalesceValue 
          = tdlUtils.coalesce
            ( valueFromResult,
              mergedValues.get(keyFromResults)
            );
        mergedValues.set ( keyFromResults, coalesceValue );
        this.setAttributeValue ( keyFromResults, coalesceValue );
      } // End if
    } // End for entry
    // Convert the merged map back to an array of arrays if needed
    this.#mergedArgumentValues = Array.from ( mergedValues );
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.mergeArgumentValues' );
    return this.#mergedArgumentValues;
  } // End function mergeArgumentValues

  determineArgumentValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.determineArgumentValues' );
    // Create an empty array
    this.#argumentValues = [];
    // const   argumentValues = [];
    for ( let resultCounter = this.#parsedArgumentList.length - 1; 
              resultCounter >= 0; 
              resultCounter--
        ) 
    { const entry = this.#parsedArgumentList [ resultCounter ];
      const entryKey = entry[0];
      const entryValue = entry[1];
      if ( entryKey !== '0' 
           && /^\d+$/.test ( entryKey ) 
           && entryValue !== null 
           && entryValue !== '' 
           && /=/.test ( entryValue )
         ) 
      { this.#argumentValues.push ( entry) ;
      } // End if
    } // End for resultCounter
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.determineArgumentValues' );
    const localResult = this.#argumentValues.length > 0 ? this.#argumentValues : null;
    //this.setArgumentValues ( localResult );
    return localResult;
  } // End function determineArgumentValues
  
  determineNonArgumentValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.determineNonArgumentValues' );
    // Create an empty array
    this.#nonArgumentValues = [];
    for ( let resultCounter = this.#parsedArgumentList.length - 1; 
              resultCounter >= 0; 
              resultCounter--
        ) 
    { const entry = this.#parsedArgumentList [ resultCounter ];
      const entryKey = entry[0];
      const entryValue = entry[1];
      if ( entryKey !== '0'
            && /^\d+$/.test ( entryKey ) 
            && entryValue !== null 
            && entryValue !== '' 
            && !/=/.test( entryValue )
         )
      { this.#nonArgumentValues.push ( entry );
      } // End if
    } // End for resultCounter
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.determineNonArgumentValues' );
    const localResult = this.#nonArgumentValues.length > 0 ? this.#nonArgumentValues : null;
    //this.setNonArgumentValues ( localResult );
    return localResult;
  } // End function getNonArgumentValues

  getAttributeValue (  nameOfAttribute )
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.getAttributeValue' );
    nameOfAttribute = nameOfAttribute.charAt(0).toUpperCase() + nameOfAttribute.slice(1);
    const methodName = 'get' + nameOfAttribute;let localResult = '';
    if ( typeof this.#classInstance [ methodName ] === 'function') {
      // Call the method dynamically and store the result
      localResult = this.#classInstance [ methodName ]();
    }  // Enf if
    else 
    { this.#templateGlobalContext.consoleWarn ( `${methodName} is not a function.` );
      // console.log(`--*** Warning: ${methodName} is not a function.`);
    } // End else
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.getAttributeValue' );
    return localResult;
  } // End getAttributeValue
  
  setAttributeValue ( nameOfAttribute, newValue )
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.setAttributeValue' );
    const wordWrapInstance = this.#templateGlobalContext.getWordWrap();
    newValue = tdlUtils.coalesce ( newValue, "" );
    nameOfAttribute = nameOfAttribute.charAt(0).toUpperCase() + nameOfAttribute.slice(1);
    const methodName = 'set' + nameOfAttribute;
    let localResult = '';
    if ( typeof this.#classInstance [ methodName ] === 'function' )
    { // Call the method dynamically and store the result
      this.#classInstance [ methodName ] ( newValue );
      localResult = this.getAttributeValue ( nameOfAttribute )
    } // End if
    else 
    { this.#templateGlobalContext.consoleWarn ( `${methodName} is not a function.` );
      // console.log(`--*** Warning: ${methodName} is not a function.`);
    } // End else
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.setAttributeValue' );
    return localResult;
  } // End function setAttributeValue

  findExistingMappedValues ( )
  { this.#templateGlobalContext.consoleTrace  ( 'Starting ArgumentList.findExistingMappedValues' );
    this.#existingMappedValues = [];
    for ( const parameterName of this.#parameterNames )
    { const value = this.getAttributeValue ( parameterName );
      if (value !== '' )
      { const existingItem = [ parameterName, value ];
        this.#existingMappedValues.push ( existingItem );
      } // End if
    } // End for parameterName
    this.#templateGlobalContext.consoleTrace  ( 'Finishing ArgumentList.findExistingMappedValues' );
    return this.#existingMappedValues;
  } // End function findExistingMappedValues

  findParameters ( )
  { // Initialize an array to store found parameters
    this.#foundParameterNames = [];
    // Iterate through the data structure
    for ( const entry of this.getArgumentValues() )
    { if ( entry && entry.length === 2 )
      { // Extract the parameter from the entry
        const parameter = entry[1].split('=')[0];
        // Add the parameter to the foundParameters array if it's not already there
        if ( !this.#foundParameterNames.includes ( parameter ) )
        { this.#foundParameterNames.push ( parameter );
        } // End if
      } // End if
    } // End for argumentValueData
    return this.#foundParameterNames;
  } // End function findParameters

  toJSON()
  { let jsonText = '';
    jsonText += '{\n';
    jsonText += '  "inputString"          :  " ' + tdlUtils.prettifyJSON ( this.getInputString() )+ '",\n';
    jsonText += '  "parsedArgumentList"   :  " ' + tdlUtils.prettifyJSON ( this.getParsedArgumentList() )+ '",\n';
    jsonText += '  "nonArgumentValues"    :  " ' + tdlUtils.prettifyJSON ( this.getNonArgumentValues () )+ '",\n';
    jsonText += '  "argumentValues"       :  " ' + tdlUtils.prettifyJSON ( this.getArgumentValues    () )+ '",\n';
    jsonText += '  "parameterNames"       :  " ' + tdlUtils.prettifyJSON ( this.getParameterNames    () )+ '",\n';
    jsonText += '  "foundParameterNames"  :  " ' + tdlUtils.prettifyJSON ( this.getFoundParameterNames() )+ '",\n';
    jsonText += '  "classInstance"        :  " ' + tdlUtils.prettifyJSON ( this.getClassInstanceName () )+ '",\n';
    jsonText += '  "missingValue"         :  " ' + this.getMissingValue         () + '",\n';
    jsonText += '  "positionalPrefix"     :  " ' + this.getPositionalPrefix     () + '",\n';
    jsonText += '  "existingMappedValues" :  " ' + tdlUtils.prettifyJSON ( this.findExistingMappedValues() ) + '",\n';
    jsonText += '  "mergedValues"         :  " ' + tdlUtils.prettifyJSON ( this.getMergedValues    () )+ '",\n';
    
    jsonText += '}\n';
    return jsonText;
  } // End function toJSON

} // End class ArgumentList

function unitTestArgumentList()
{ let templateGlobalContext = new TemplateGlobalContext();
  templateGlobalContext.setTraceState ( false );
  let argumentList          = new ArgumentList ( templateGlobalContext );
  argumentList.setParameterNames ( parameterNames );
  argumentList.setClassInstance ( templateGlobalContext.getWordWrap() );
  
  const parameters                 = parameterNames;
  console.log ( '===== parameters : ' + parameters );
  // templateGlobalContext.setTraceState ( false );
  
  let listOfCmdStrings = new Array();
  let listOfCmdResults = new Array();
  listOfCmdStrings[0] = 'class=plaintext lineLength=77 "this is some text" postfix="**/" "And here is more text"';
  let cmdCounter = 0;
  console.log ( '=====  listOfCmdStrings[' + cmdCounter + '] : ' +  listOfCmdStrings[0] );
  listOfCmdResults[cmdCounter] = argumentList.parseArgumentString ( parameters, listOfCmdStrings[0] ) ;
  console.log ( JSON.stringify ( listOfCmdResults[cmdCounter] ) );
  console.log ( '@@@ JSON ->\n' + argumentList.toJSON() );

  console.log ( '@@@ found parameters: ' + JSON.stringify ( argumentList.getFoundParameterNames ( ) ) );
  console.log ( '@@@ found parameters: ' + JSON.stringify ( argumentList.getMergedValues ( ) ) );
  templateGlobalContext.dumpGlobalsContext ( 'GLOBAL' );

} // End function unitTestArgumentList

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ unitTestArgumentList();
} // End if