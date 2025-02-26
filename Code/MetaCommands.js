/**
 * File: MetaCommands.js
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
 * @class MetaCommands
 * @description Describes the TDL Meta-Commands.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from "./TemplateGlobalContext.js";

//===== Class Definition =====
export default class MetaCommands
{ //===== Private
  /**
   * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
   * @type { TemplateGlobalContext }
   * @private
   */
   #templateGlobalContext
   #listOfCommands;
   #metaCommandArray;
   #undefinedArr
   #metaIndicator;
   #metaSettings;
   #metaIndicatorName = 'metaCommandIndicator';
   #logicalExpressionCommand;

    //===== Constructors 
    constructor
      ( metaIndicator = '_',  
        commandIndicator = '#', 
        templateGlobalContext
      )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to MetaCommands, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      templateGlobalContext.consoleTrace ( 'Starting MetaCommands Constructor' );
      if ( typeof metaIndicator !== 'string' || metaIndicator.trim() === '' ) 
      { metaIndicator = '_';
      } // End if
      if ( typeof commandIndicator !== 'string' || commandIndicator.trim() === '' )
      { commandIndicator = '#';
      } // End if  
      this.#templateGlobalContext = templateGlobalContext;
      this.#metaSettings = this.#templateGlobalContext.getMetaSettings(); 
      this.#metaIndicator = metaIndicator;
      this.resetToDefault ( metaIndicator, commandIndicator );
      templateGlobalContext.consoleTrace ( 'Finishing MetaCommands Constructor' );
    } // End constructor MetaCommands

    resetToDefault ( metaIndicator = '_', commandIndicator = '#' )
    { this.#templateGlobalContext.consoleTrace ( 'Starting MetaCommands.resetToDefault -> ' + metaIndicator );
      if ( typeof metaIndicator !== 'string' 
           || metaIndicator === null 
           || metaIndicator.trim() === ''
         ) 
      { this.#metaSettings = this.#templateGlobalContext.getMetaSettings();
        metaIndicator = this.#metaSettings.getMetaIndicator();
      } // End if
      metaIndicator = '';
      // this.#metaIndicator  = metaSettings.getMetaSettingByKey ( this.#metaIndicatorName );
      // let commandIndicator = (""+this.#metaIndicator).split(',' )[1];
      //commandIndicator = '_#';
      let metaOpIndicator = ''; // = metaIndicator + commandIndicator;
      this.#listOfCommands = new Map();
      this.#listOfCommands.set ( 'UNDEFINED',     metaOpIndicator + 'UNDEFINED' );
      this.#listOfCommands.set ( 'BREAK',         metaOpIndicator + 'BREAK');
      this.#listOfCommands.set ( 'QUESTION_OP',   metaIndicator   + '?');
      this.#listOfCommands.set ( 'CURSOR',        metaOpIndicator + 'CURSOR');
      this.#listOfCommands.set ( 'DEBUG',         metaOpIndicator + 'DEBUG');
      this.#listOfCommands.set ( 'DEFINE',        metaOpIndicator + 'DEFINE');
      this.#listOfCommands.set ( 'DUMP',          metaOpIndicator + 'DUMP');
      this.#listOfCommands.set ( 'ECHO',          metaOpIndicator + 'ECHO');
      this.#listOfCommands.set ( 'EOF',           metaOpIndicator + 'EOF');
      this.#listOfCommands.set ( 'EXIT',          metaOpIndicator + 'EXIT');
      this.#listOfCommands.set ( 'IF',            metaOpIndicator + 'IF');
      this.#listOfCommands.set ( 'ELSIF',         metaOpIndicator + 'ELSIF');
      this.#listOfCommands.set ( 'ELSE_IF',       metaOpIndicator + 'ELSEIF');
      this.#listOfCommands.set ( 'ELSE',          metaOpIndicator + 'ELSE');
      this.#listOfCommands.set ( 'ENDIF',         metaOpIndicator + 'ENDIF');
      this.#listOfCommands.set ( 'END_LOOP',      metaOpIndicator + 'ENDLOOP');
      this.#listOfCommands.set ( 'IF_DEF',        metaOpIndicator + 'IFDEF');
      this.#listOfCommands.set ( 'IF_NOT_DEF',    metaOpIndicator + 'IFNDEF');
      this.#listOfCommands.set ( 'IF_NOT_SET',    metaOpIndicator + 'IFNSET');
      this.#listOfCommands.set ( 'IF_SET',        metaOpIndicator + 'IFSET');
      this.#listOfCommands.set ( 'INCLUDE',       metaOpIndicator + 'INCLUDE');
      this.#listOfCommands.set ( 'LOOP',          metaOpIndicator + 'LOOP');
      this.#listOfCommands.set ( 'MACRO_BEGIN',   metaIndicator    + '{' );
      this.#listOfCommands.set ( 'MACRO_END',     metaIndicator    + '}' );
      this.#listOfCommands.set ( 'MOVE',          metaOpIndicator + 'MOVE');
      this.#listOfCommands.set ( 'OUTPUT',        metaOpIndicator + 'OUTPUT');
      this.#listOfCommands.set ( 'PUT',           metaOpIndicator + 'PUT');
      this.#listOfCommands.set ( 'PUT_LINE',      metaOpIndicator + 'PUTLINE');
      this.#listOfCommands.set ( 'SET',           metaOpIndicator + 'SET');
      this.#listOfCommands.set ( 'THEN',          metaOpIndicator + 'THEN');
      this.#listOfCommands.set ( 'TRACE',         metaOpIndicator + 'TRACE');
      this.#listOfCommands.set ( 'UN_DEFINE',     metaOpIndicator + 'UNDEFINE');
      this.#listOfCommands.set ( 'UN_SET',        metaOpIndicator + 'UNSET');
      this.#listOfCommands.set ( 'WORDWRAP',      metaOpIndicator + 'WORDWRAP');
      this.#listOfCommands.set ( 'WW',            metaOpIndicator + 'WW' );

      this.#logicalExpressionCommand = [ 'IF',  'ELSIF', 'ELSEIF' ];

      this.#metaCommandArray
        = Array.from ( this.#listOfCommands );
      
      this.#undefinedArr 
        = this.#metaCommandArray.filter
            ( function ( [ key, value ] )
              { return key === ( "UNDEFINED" );
              }
           );
      this.#templateGlobalContext.consoleTrace ( 'Finishing MetaCommands.resetToDefault -> ' + this.#undefinedArr );
    } // End restToDefault

  //===== Getters

    getListOfCommands()
    { this.#templateGlobalContext.consoleTrace ( 'Executing MetaCommands.getListOfCommands ' );
      return this.#listOfCommands;
    } // End function getListOfCommands
    
    getMetaIndicator()
    { this.#templateGlobalContext.consoleTrace ( 'Executing MetaCommands.getMetaIndicator -> ' + this.#metaIndicator );
      this.#metaIndicator;
    } // End function getMetaIndicator

    getMetaCommandByKey ( keyValue )
    { this.#templateGlobalContext.consoleTrace ( 'Starting MetaCommands.getMetaCommandByKey -> ' + keyValue );
      const localKeyValue    = keyValue;
      let filteredArray
        = this.#metaCommandArray.filter
              ( function ( [ key, value ] )
                { return key === localKeyValue; // this.#metaIndicator
                }
             );
      if ( ! filteredArray || keyValue.trim().length == 0 )
      { filteredArray = this.#undefinedArr;
      } // End else
      filteredArray = ( "" + filteredArray ).split(",");
      this.#templateGlobalContext.consoleTrace ( 'Finishing MetaCommands.getMetaCommandByKey -> ' + filteredArray );
      return filteredArray;
    } // End function getMetaCommandByKey

  getMetaCommandByValue ( targetValue )
  { this.#templateGlobalContext.consoleTrace ( 'Starting MetaCommands.getMetaCommandByValue -> ' + targetValue );
    const localTargetValue = targetValue;
    let filteredArray
      = this.#metaCommandArray.filter
            ( function ( [ key, value ] )
              { return value === localTargetValue; // this.#metaIndicator
              } // End anonymous function
           );
    if ( ! filteredArray 
         || filteredArray.toString().trim().length === 0 
         || targetValue.trim().length == 0 
      )
    { filteredArray = this.#undefinedArr;
    } // End else
    filteredArray = ( "" + filteredArray ).split(",");
    this.#templateGlobalContext.consoleTrace ( 'Finishing MetaCommands.getMetaCommandByValue -> ' + filteredArray );
    return filteredArray;
  } // End function getMetaCommandByValue

  hasLogicalExpression ( targetCmd ) 
    { this.#templateGlobalContext.consoleTrace ( 'Starting MetaCommands.hasLogicalExpression -> ' + targetCmd );
      targetCmd = targetCmd.trim().toUpperCase();
      let localResult = this.#logicalExpressionCommand.includes ( targetCmd );
      this.#templateGlobalContext.consoleTrace ( 'Finishing MetaCommands.hasLogicalExpression -> ' + localResult );
      return localResult;
    } // End function hasLogicalExpression

  toJSON()
   { this.#templateGlobalContext.consoleTrace ( 'Starting MetaCommands.toJSON ' );
     let jsonText
       =  "\n{\n"
          + "  \"listOfCommands\"     : \"" + this.#metaCommandArray + "\",\n"
          + "  \"undefinedArr\"       : \"" + this.#undefinedArr + "\",\n"
          + "  \"metaIndicator\"      : \"" + this.#metaIndicator + "\"\n"
          +"}\n";
      this.#templateGlobalContext.consoleTrace ( 'Finishing MetaCommands.toJSON ->\n' + jsonText );
     return jsonText
   } // End function toJSON

 } // End class MetaCommands

    
function testMetaCommands()
{ let templateGlobalContext = new TemplateGlobalContext();
  templateGlobalContext.setTraceState ( false );
  console.log ( '\n\n ======== testMetaCommands ==========' );
  console.log ( "\n--==== STEP : 1.0 key: LOOP" );
  let metaCommand = new MetaCommands( '_', '#', templateGlobalContext );
  let metaCommandValue;
  console.log ( "\n--==== STEP : 1.2" );
  metaCommand = new MetaCommands ( '_', '#', templateGlobalContext ); 
  console.log ( "\n--==== STEP : 2.0 key: LOOP" );
  console.log ( metaCommandValue = metaCommand.getMetaCommandByKey ( 'LOOP' ) );
  console.log ( "\n--==== STEP : 2.1 key: ''" );
  console.log ( metaCommandValue = metaCommand.getMetaCommandByValue ( '' ) );

  console.log ( "\n--==== STEP : 3.0 Value: _#LOOP" );
  console.log ( metaCommand.getMetaCommandByValue ( "_#LOOP" ) );
  console.log ( "--==== FINISH " );
} // End function testMetaCommands
    
/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  testMetaCommands();
} // End if