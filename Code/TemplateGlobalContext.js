/**
 * File: TemplateGlobalContext.js
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
 * @class TemplateGlobalContext
 * @description contains the singleton instances of the classes used by 
 * all the classes in the TemplateFoundry.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import ArgumentList                    from './ArgumentList.js';
import CursorStatement                 from './CursorStatement.js';
import CursorDefinition                from './CursorDefinitions.js';
import EnvironmentSettings             from './EnvironmentSettings.js';
import FileIO                          from './FileIO.js';
import GlobalSettings                  from './GlobalSettings.js';
import HostCommands                    from './HostCommands.js';
import LocalVariableStack              from './LocalVariableStack.js';
import LoopStack                       from './LoopStack.js';
import MacroStack                      from './MacroStack.js';
import MetaCommands                    from './MetaCommands.js';
import MetaSettings                    from './MetaSettings.js';
import process                         from 'process';
import TdlUtils, * as TdlUtilFunctions from './TdlUtils.js';
import TypeStandards                   from './TypeStandards.js';
import TypeSupport                     from './TypeSupport.js';
import { splitIntoNewLines
       }                               from './TdlUtils.js';
import WordWrap                        from './WordWrap.js';
import { Console }                     from 'console';

//===== Class Definition =====
export default class TemplateGlobalContext
{ //===== Private Attribute
    #tracingState  = false;
    #infoState     = false;
    #warnState     = true;
    #reThrowErrors = false;
    #metaIndicator;
    #parentDirectory;
    #fileIO;
    #metaSettings;
    #metaCommands;
    #globalSettings;
    #environmentSettings;
    #localVariableStack;
    #typeSupport;
    #typeStandards;
    #tdlUtils;
    #macroStack;
    #wordWrap;
    #argumentList;
    #cursorStatement;
    #cursorDefinition;
    #loopStack;
    #hostCommands;
  
  //===== Constructors 
    constructor
      ( metaIndicator        = '_', 
        metaCommandIndicator = '#', 
        parentDirectory      = process.cwd(),
        trace                = false
      )
    { this.consoleTrace ( 'Starting TemplateGlobalContext Constructor' ); 
      if ( typeof metaIndicator !== 'string' || metaIndicator.trim() === '' ) 
      { metaIndicator = '_';
      } // End if
      if ( typeof metaCommandIndicator !== 'string' || metaCommandIndicator.trim() === '' )
      { metaCommandIndicator = '#';
      } // End if
      if ( typeof parentDirectory !== 'string' || parentDirectory.trim() === '')
      { parentDirectory = process.cwd();
      } // End if
      if ( TdlUtilFunctions.isOnOrOff ( trace) )
      { trace = TdlUtilFunctions.isOn ( trace );
      } //End if
      else
      { trace = false;
      } // End else
      this.setReThrowErrors ( false );
      this.#reset ( metaIndicator, metaCommandIndicator, parentDirectory );
      this.consoleTrace ( 'Finishing TemplateGlobalContext Constructor');
    } // End constructor TemplateGlobalSpace

  //===== Private Operations
    #reset ( metaIndicator = '_', 
             metaCommandIndicator = '#', 
             parentDirectory = process.cwd()
           ) 
    { this.consoleTrace ( '#reset TemplateGlobalContext Starting' );
      if ( typeof metaIndicator !== 'string' || metaIndicator.trim() === '' ) 
      { metaIndicator = '_';
      } // End if
      if ( typeof metaCommandIndicator !== 'string' || metaCommandIndicator.trim() === '' )
      { metaCommandIndicator = '#';
      } // End if
      if ( typeof parentDirectory !== 'string' || parentDirectory.trim() === '')
      { parentDirectory = process.cwd();
      } // End if
      this.#metaIndicator        = metaIndicator;
      this.#parentDirectory      = parentDirectory;
      this.#metaSettings         = new MetaSettings( metaIndicator, this );
      this.#environmentSettings  = new EnvironmentSettings ( parentDirectory, this );
      this.#metaCommands         = new MetaCommands ( metaIndicator, metaCommandIndicator, this );
      this.#localVariableStack   = new LocalVariableStack( this );
      this.#fileIO               = new FileIO( 'utf-8', this );
      this.#tdlUtils             = new TdlUtils ( this );
      this.#macroStack           = new MacroStack ( this );
      this.#wordWrap             = new WordWrap ( this );
      this.#cursorStatement      = new CursorStatement ( this );
      this.#cursorDefinition     = new CursorDefinition ( this );
      this.#loopStack            = new LoopStack ( this );
      this.#hostCommands         = new HostCommands ( this );
      this.#argumentList         = new ArgumentList ( this );
      this.#typeStandards        = new TypeStandards ( this );
      this.#typeSupport          = new TypeSupport ( this );
      this.#globalSettings       = new GlobalSettings ( this );
      this.consoleTrace ( '#reset TemplateGlobalContext Finishing' );
    } // End function #reset

  //===== Getters

    get ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.get -> ' + key );
      key = key.toString();
      let localResult = undefined;
      if ( key )
      { if ( this.#localVariableStack.has ( key ) )
        { localResult = this.#localVariableStack.get ( key );
        } // End if
        else if ( this.#metaSettings.has ( key ) )
        { localResult = this.#metaSettings.get ( key );
        } // End if
        else if ( this.#environmentSettings.has ( key ) )
        { localResult = this.#environmentSettings.get ( key );
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.get -> ' + localResult );
      return localResult;
    } // End function get

    has ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.has -> ' + key );
      key = key.toString();
      let localResult = false;
      if ( key )
      { if ( this.#localVariableStack.has ( key ) )
        { localResult = true;
        } // End if
        else if ( this.#metaSettings.has ( key ) )
        { localResult = true;
        } // End if
        else if ( this.#environmentSettings.has ( key ) )
        { localResult = true;
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.has -> ' + localResult );
      return localResult;
    } // End function has

    isGloballySet ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.isGloballySet -> ' + key );
      let localResult = false;
      if ( key )
      { if ( this.#metaSettings.has ( key ) )
        { localResult = true;
        } // End if
        else if ( this.#environmentSettings.has ( key ) )
        { localResult = true;
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.isGloballySet -> ' + localResult );
      return localResult;
    } // End function isGloballySet

    whereIs ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.whereIs -> ' + key );
      let localResult = new Array();
      if ( key )
      { if ( this.#localVariableStack.has ( key ) )
        { localResult = 'localVariable';
        } // End if
        else if ( this.#metaSettings.has ( key ) )
        { localResult = 'metaSettings';
        } // End if
        else if ( this.#environmentSettings.has ( key ) )
        { localResult = 'environmentSettings';
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.whereIs -> ' + localResult );
      return localResult;
    } // End function whereIs

    getArgumentList ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getArgumentList' );
      return this.#argumentList;
    } // End function getArgumentList

    getEnvironmentSettings ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getEnvironmentSettings' );
      return this.#environmentSettings;
    } // End function getEnvironmentSettings

    getFileIO ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getFileIO' );
      return this.#fileIO;
    } // End function getFileIO

    getTdlUtils ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getTdlUtils' );
      return this.#tdlUtils;
    } // End function getTdlUtils
    
    getLocalVariableStack ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getLocalVariableStack' );
      return this.#localVariableStack;
    } // End function getLocalVariableStack

    getMacroStack ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getMacros' );
      return this.#macroStack;
    } // End function getMacroStack

    getMetaCommands ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getMetaCommands' );
      return this.#metaCommands;
    } // End function getMetaCommands
  
    getMetaCommandList ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getMetaCommandList' );
      return this.#metaCommands.getListOfCommands();
    } // End function getMetaCommandList
  
    getMetaIndicator ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getMetaIndicator' );
      return this.#metaIndicator;
    } // End function getMetaIndicator
  
    getMetaSettings ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getMetaSettings' );
      return this.#metaSettings;
    } // End function getMetaSettings
  
    getParentDirectory ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getParentDirectory' );
      return this.#parentDirectory;
    } // End function getParentDirectory

    getTypeStandards ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getTypeStandards' );
      return this.#typeStandards;
    } // End function getTypeStandards
    
    getTypeSupport ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getTypeSupport' );
      return this.#typeSupport;
    } // End function getTypeSupport
    
    getWordWrap ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getWordWrap' );
      return this.#wordWrap;
    } // End function getWordWrap

    getCursorStatement ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getCursor' );
      return this.#cursorStatement;
    } // End function getCursorStatement

    getCursorDefinitions ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getCursorDefinitions' );
      return this.#cursorDefinition;
    } // End function getCursorDefinitions

    getLoopStack ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getLoopStack' );
      return this.#loopStack;
    } // End function getLoopStack

    getHostCommands ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getLoopStack' );
      return this.#hostCommands;
    } // End function getHostCommands

    getGlobalSettings ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.globalSettings' );
      return this.#globalSettings;
    } // End function getGlobalSettings

    getReThrowErrors ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getReThrowErrors -> ' + this.#reThrowErrors );
      return this.#reThrowErrors;
    } // End function getReThrowErrors

    getInfoState ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getInfoState -> ' + this.#infoState );
      return this.#infoState;
    }; // End function getInfoState

    getTraceState ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getTraceState -> ' + this.#tracingState );
      return this.#tracingState;
    }; // End function getTraceState

    getWarnState ()
    { this.consoleTrace ( 'Executing TemplateGlobalContext.getInfoState -> ' + this.#warnState );
      return this.#warnState;
    }; // End function getWarnState

    dumpGlobalsContext ( globalComponent )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.dumpGlobalsContext -> ' + globalComponent );
      if ( ! globalComponent ) 
      { globalComponent = 'ALL';
      } // End if
      globalComponent = globalComponent?.trim().toUpperCase();
      if ( globalComponent === 'ENVIRONMENT' || globalComponent === 'ALL' )
      { console.log ( '===== Starting Dump of ENVIRONMENT ===== ');
        console.log ( this.getEnvironmentSettings().toJSON()  );
        console.log ( '===== Finishing Dump of ENVIRONMENT ===== ');
        
      } // End if
      if ( globalComponent === 'GLOBAL' || globalComponent === 'ALL' )
      { console.log ( '===== Starting Dump of GLOBAL ===== ');
        console.log ( this.getMetaSettings().toJSON()  );
        console.log ( '===== Finishing Dump of GLOBAL ===== ');
        
      } // End if
      if ( globalComponent === 'SETTINGS'  || globalComponent === 'ALL' )
      { console.log ( '===== Starting Dump of SETTINGS ===== ');
        console.log ( this.getMetaSettings().toJSON() );
        console.log ( '===== Finishing Dump of SETTINGS ===== ');
        
      } // End if
      if ( globalComponent === 'STACK'  || globalComponent === 'LOCAL' || globalComponent === 'ALL'  )
      { console.log ( '===== Starting Dump of STACK ===== ');
        console.log ( this.getLocalVariableStack().getValueArray()  );
        console.log ( '===== Finishing Dump of STACK ===== ');
      } // End if

      if ( globalComponent === 'MACROS'  || globalComponent === 'ALL'  )
      { console.log ( '===== Starting Dump of MACROs ===== ');
        console.log ( this.getMacroStack().toJSON()  );
        console.log ( '===== Finishing Dump of MACROs ===== ');
      } // End if
      if ( globalComponent === 'CURSORS'  || globalComponent === 'ALL'  )
      { console.log ( '===== Starting Dump of CURSORs ===== ');
        console.log ( this.getCursorDefinitions().toJSON()  );
        console.log ( '===== Finishing Dump of CURSORs ===== ');
      } // End if
      this.consoleTrace ( 'Finishing TemplateGlobalContext.dumpGlobalsContext -> ' + globalComponent );
    } // End dumpGlobalsContext
    
  //===== Setters

    delete ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.delete -> ' + key );
      let localResult = false;
      if ( key )
      { if ( this.#localVariableStack.has ( key ) )
        { localResult = this.#localVariableStack.delete ( key );
        } // End if
        else if ( this.#metaSettings.has ( key ) )
        { localResult = this.#metaSettings.delete ( key );
        } // End if
        else if ( this.#environmentSettings.has ( key ) )
        { localResult = this.#environmentSettings.delete ( key );
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.delete -> ' + localResult );
      return localResult;
    } // End function delete
  
    deleteAll ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.deleteAll -> ' + key );
      let localResult = false;
      if ( key )
      { if ( this.#localVariableStack.has ( key ) )
        { localResult = this.#localVariableStack.delete ( key );
        } // End if
        if ( this.#metaSettings.has ( key ) )
        { localResult = this.#metaSettings.delete ( key );
        } // End if
        if ( this.#environmentSettings.has ( key ) )
        { localResult = this.#environmentSettings.delete ( key );
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.deleteAll -> ' + key );
      return localResult;
    } // End function deleteAll

    deleteGlobally ( key )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.deleteGlobally -> ' + key );
      let localResult = false;
      if ( key )
      { if ( this.#metaSettings.has ( key ) )
        { localResult = this.#metaSettings.delete ( key );
        } // End if
        if ( this.#environmentSettings.has ( key ) )
        { localResult = this.#environmentSettings.delete ( key );
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.deleteGlobally -> ' + localResult );
      return localResult;
    } // End function deleteGlobally

    set ( key, value )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.set -> ' + key + ', ' + value );
      key = key.toString(); // Fix Javascript map bug. make sure keys are strings.
      let variableLocation;
      if ( key )
      { if ( this.#localVariableStack.has ( key ) )
        { localResult = this.#localVariableStack.set ( key, value);
          variableLocation = 'LOCAL';
        } // End if
        else if ( this.#metaSettings.has ( key ) )
        { localResult = this.#metaSettings.set ( key, value  );
          variableLocation = 'GLOBAL';
        } // End if
        else if ( this.#environmentSettings.has ( key ) )
        { localResult = this.#environmentSettings.set ( key, value );
          variableLocation = 'ENVIRONMENT';
        } // End if
      } // End else
      this.consoleTrace ( 'Finishing TemplateGlobalContext.set -> ' + variableLocation );
      return variableLocation;
    } // End function set

    setMetaIndicator ( metaIndicator = '_' )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.setMetaIndicator -> ' + metaIndicator );
      this.#reset ( metaIndicator, this.#parentDirectory );
      this.consoleTrace ( 'Finishing TemplateGlobalContext.setMetaIndicator -> ' + metaIndicator );
    } // End getMetaIndicator
    
    setParentDirectory ( parentDirectory = process.cwd() )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.setParentDirectory -> ' + parentDirectory );
      this.#reset ( this.#metaIndicator, parentDirectory );
      this.consoleTrace ( 'Finishing TemplateGlobalContext.setParentDirectory -> ' + parentDirectory );
    }

    setReThrowErrors ( newValue )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.setReThrowErrors -> ' + newValue );
      this.#reThrowErrors = Boolean ( newValue );
      this.consoleTrace ( 'Finishing TemplateGlobalContext.setReThrowErrors -> ' + this.#tracingState );
    } // End function setTrace

    setInfoState ( newValue )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.setInfoState -> ' + newValue );
      this.#infoState = Boolean ( newValue );
      this.consoleTrace ( 'Finishing TemplateGlobalContext.setInfoState -> ' + this.#infoState );
    } // End function setInfoState

    setTraceState ( newValue )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.setTraceState -> ' + newValue );
      this.#tracingState = Boolean ( newValue );
      this.consoleTrace ( 'Finishing TemplateGlobalContext.setTraceState -> ' + this.#tracingState );
    } // End function setTraceState

    setWarnState ( newValue )
    { this.consoleTrace ( 'Starting TemplateGlobalContext.setWarnState -> ' + newValue );
      this.#warnState = Boolean ( newValue );
      this.consoleTrace ( 'Finishing TemplateGlobalContext.setWarnState -> ' + this.#tracingState );
    } // End function setWarnState

    //----- setDataObject
    setDataObject ( templateGlobalContext, context, dataObject, prefix, separator )
    { this.consoleTrace ( 'Starting TdlUtils.setDataObject' );
      let currentSeparator = separator;
      if ( (prefix === null || prefix === undefined || prefix.trim().length <= 0 ) ) 
      { currentSeparator = '';
      } // End if
      let variableCounter = 0;
      for ( const key in dataObject )
      { const variableName = prefix + currentSeparator + key;
        if ( dataObject.hasOwnProperty(key) ) 
        { const value = dataObject[key];
          this.consoleTrace (`-- key:value -> ${variableName}: ${value}` + ' typeof: ' + typeof value );
          if (typeof value === "object" && value !== null)
          { //console.log("--*** WARN The variable " + key + " is an object.");
            variableCounter = variableCounter + this.setDataObject ( templateGlobalContext, context, value, key, separator );
          } // End if
          else
          { 
            if ( context === 'GLOBAL'.substring ( 0, Math.max ( context.length, 1) ) )
            { templateGlobalContext.getMetaSettings().set ( variableName, value );
              variableCounter++;
            } // End if
            else if ( context === 'ENVIRONMENT'.substring ( 0, context.length ) )
            { templateGlobalContext.getEnvironmentSettings().set ( variableName,  value );
              variableCounter++;
            } // end elseif
            else
            { console.log ( '--*** Context "' + context + '" must be GLOBAL or ENVIRONMENT' );
            } // End else
          } // End else
        } // End if
      } // End for
      this.consoleTrace ( 'Finishing TdlUtils.setDataObject' );
      return variableCounter;
    } // End setDataObject
    
    //----- setGlobalSettings
    setGlobalSettings ( templateGlobalContext, context, jsonData, separator )
    { this.consoleTrace ( 'Starting TdlUtils.setGlobalSettings' );
      // Step 1: Parse JSON data into a JavaScript object
      const dataObject = JSON.parse ( jsonData );
      // Step 2: Iterate through the elements of the JavaScript object
      let variableCounter = this.setDataObject ( templateGlobalContext, context, dataObject, '', separator );
      this.consoleTrace ( 'Finishing TdlUtils.setGlobalSettings' );
      return variableCounter;
    } // End function setGlobalSettings

  //===== General Operations

    /**
     * Safely trims input text.
     * - If the input is a string, it trims whitespace from both sides.
     * - If the input is not a string, it returns an empty string.
     *
     * @param {any} text - The input to be trimmed.
     * @returns {string} The trimmed string or an empty string for non-string inputs.
     */
    safeTrim ( text )
    { let localResult = ''; //  empty string for non-string inputs
      if (typeof text === 'string')
      { localResult = text.trim();
      } // End if
      return localResult;
    } // End function safeTrim

    consoleTrace ( text )
    { if ( this.#tracingState ) 
      { text = this.safeTrim ( text );
        console.log ( '--++ ' + text );
      } // End if 
    } // End consoleTrace

    consoleWarn ( text )
    { if ( this.#warnState ) 
      { text = this.safeTrim ( text );
        text = splitIntoNewLines ( '--!!', ' Warning: ' + text );
        console.log ( text );
      } // End if 
    } // End consoleWarn

    consoleInfo ( text )
    { if ( this.#infoState ) 
      { // console.log ( '--== ' + text.trim() );
        text = this.safeTrim ( text );
        text = splitIntoNewLines ( '--==', text );
        console.log ( text );
      } // End if 
    } // End consoleInfo

    consoleError ( errorText  )
    { let errorMessage = "Undefined Error Reported";
      let errorNumber = -1;
      let errorName = "TDL General Error";
      let errorStack;
      if ( errorText !== undefined && errorText !== null )
      { if ( errorText && typeof errorText === "string" )
        { let indexOfSpace = errorText.indexOf('\w');
          errorNumber = errorText.substring(0, indexOfSpace).trim();
          if ( typeof errorNumber !== "number" )
          { errorMessage = errorText;
          } // End if
          else
          { errorMessage = errorText.substring(indexOfSpace + 1).trim();
          } // End else
        } // End if
        if ( errorText instanceof Error )
        { errorMessage = errorText.message;
          errorNumber  = errorText.errno;
          errorName    = errorText.name;
          errorStack   = errorText.stack;
        } // End if
      } // End if
      let newError = new Error ( errorMessage );
      newError.errno = errorNumber;
      newError.name  = errorName;
      if ( errorStack ) 
      { newError.stack = errorStack;
      } // end if
      console.log ( '--*** Error: number: ' + newError.errno + '\n--*** text: "' + newError.message + '"' );
      throw newError;
    } // End consoleError

    toJSON()
    { this.consoleTrace ( 'Starting TemplateGlobalContext.toJSON ' );
      let jsonText
        =  "\n{\n"
           + "  \"tracingState\"           : \"" + this.#tracingState  + "\",\n"
           + "  \"infoState\"              : \"" + this.#infoState  + "\",\n"
           + "  \"metaIndicator\"          : \"" + this.#metaIndicator  + "\",\n"
           + "  \"parentDirectory\"        : \"" + this.#parentDirectory + "\",\n"
           + "  \"metaSettings\"           : \"" + this.#metaSettings.toJSON() + "\",\n"
           + "  \"metaCommands\"           : \"" + this.#metaCommands.toJSON() + "\",\n"
           + "  \"environmentSettings\"    : \"" + this.#environmentSettings.toJSON() + "\",\n"
           + "  \"localVariableStack\"     : \"" + this.#localVariableStack.toJSON() + "\",\n"
           + "  \"fileIO\"                 : \"" + this.#fileIO.toJSON() + "\"\n"
           + "  \"cursor\"                 : \"" + this.#cursorStatement.toJSON() + "\"\n"
           +"}\n"
      this.consoleTrace ( 'Finishing TemplateGlobalContext.toJSON\n' + jsonText );
      return jsonText
    } // End function toJSON
  
} // End class TemplateGlobalContext

function unitTestTemplateGlobalContext()
{ let fileIO;
  let fileContents;
  console.log ( "--===== TestTemplateGlobalContext Starting =====");
  let templateGlobalContext = new TemplateGlobalContext();
  console.log ( "--===== Step 1.0");
  console.log ( "-- MetaCommandIndicator : " + templateGlobalContext.getMetaIndicator() );
  console.log ( "--===== Step 2.0");
  console.log ( "-- ParentDirectory      : " + templateGlobalContext.getParentDirectory() );
  console.log ( "--===== Step 3.0");
  console.log ( "--getMetaSettings" );
  console.log ( templateGlobalContext.getMetaSettings() );
  console.log ( "--===== Step 4.0");
  console.log ( "--getMetaCommandList" );
  console.log ( templateGlobalContext.getMetaCommandList() );
  console.log ( "--===== Step 5.0");
  console.log ( "--getEnvironmentSettings" );
  console.log ( templateGlobalContext.getEnvironmentSettings() );
  console.log ( "--getEnvironmentSettings" );
  console.log ( "--===== Step 6.0");
  fileIO = templateGlobalContext.getFileIO();
  fileContents = fileIO.synchronouslyReadFile ( './Templates/example.txt' );
  console.log ( templateGlobalContext.toJSON() );
  console.log ( "--===== TestTemplateGlobalContext Finishing =====");
} // End function unitTestTemplateGlobalContext

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestTemplateGlobalContext();
} // End if