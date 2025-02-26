
/**
 * File: TemplateFile.js
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
 * @class TemplateFile
 * @description describes the details of a template file as it is 
 * being processed.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import FileIO                          from './FileIO.js';
import TemplateGlobalContext           from './TemplateGlobalContext.js';
import process                         from 'process';
import * as TdlUtils                   from './TdlUtils.js';
import * as path                       from 'path';
import * as constants                  from 'constants';

//===== Class Definition =====
export default class TemplateFile
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext
    #fileContents = [];
    #fileIO;
    #filename;
    #lineNumber;

   //===== Constructors 
   constructor ( fileDetails,  templateGlobalContext )
   { if ( !templateGlobalContext )
     { console.log ( '--*** No TemplateGlobalContext provided to TemplateFIle, creating new local copy.' );
       templateGlobalContext = new TemplateGlobalContext ( );
     } // End if
     if ( !fileDetails )
     { console.log ( '--*** fileDetails "' + fileDetails + '" must be defined' );
       throw 'fileDetails can not be undefined';
     } // End if
     templateGlobalContext.consoleTrace ( 'Starting TemplateFile.TemplateFile Constructor');
     this.#templateGlobalContext = templateGlobalContext;
     const rootDirectory         = this.#templateGlobalContext.getEnvironmentSettings().get ( "rootDirectory" );
     this.#lineNumber            = -1;
     this.#fileContents          = [];
     let isJasonFile             = false;
     let jsonText                = '';
     if ( Array.isArray ( fileDetails ) )
     { this.#filename = 'macro:'
       this.#fileContents = fileDetails;
     } // End if
     else
     { if ( TdlUtils.startsAndEndsWithChevrons ( fileDetails)  )
       { // FIlespec with Chevrons
         fileDetails = trimRight( trimLeft ( fileDetails, '<' ), '>');
         const templatePath  = this.#templateGlobalContext.getEnvironmentSettings().get ( "templatePath" );
         fileDetails = path.join ( rootDirectory, templatePath, fileDetails );
       } // End if
       else if ( TdlUtils.startsAndEndsWithLiteral ( fileDetails)  )
       { // Filespec with literals either ' or "
         fileDetails = trim ( fileDetails, fileDetails.charAt(0) );
         if ( ! path.isAbsolute ( fileDetails ) )
         { // Relative Path, join with root
           fileDetails = path.join ( rootDirectory, fileDetails );
         } // End if
       } // End if
       else if ( TdlUtils.startsAndEndsWithCaret ( fileDetails ) )
       { fileDetails = trimRight( trimLeft ( fileDetails, '^' ), '^');
         isJasonFile = true;
       } // End if
       if ( TdlUtils.isPathWithinRoot ( rootDirectory, fileDetails ) )
       { this.#filename = fileDetails;
         if ( isJasonFile )
         { jsonText = templateGlobalContext.getFileIO().synchronouslyReadFile ( fileDetails, false );
           try
           { let parsedData = JSON.parse ( jsonText );
           } // End try
           catch ( error )
           { let errorNumber = error.errorNumber;
             let message = "Fie specification : '" + fileDetails + "' is not valid JSON format.\nError: " + errorNumber + '\nmessage: ' + error.message;
             templateGlobalContext.consoleError 
             ( errorNumber,
               message
             );
           process.exit ( errorNumber );
           } // End if
           templateGlobalContext.setGlobalSettings ( templateGlobalContext, 'GLOBAL', jsonText, '-' );
           //templateGlobalContext.getLocalVariableStack().setFromJson (jsonText, 'GLOBAL'  );
         } // End if
         else
         { this.loadTemplateFile ( fileDetails );
         } // End else 
       } // End if
       else
       { let errorNumber = 1; // constants.errno.EACCES;
         let message = "Access to : '" + fileDetails + "' Error: " + errorNumber;
         templateGlobalContext.consoleError 
           ( errorNumber,
             message
           );
         process.exit ( errorNumber );
       } // End if
     } // End else
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.TemplateFile Constructor' );
   } // End constructor TemplateGlobalSpace
   
   //===== Getters
   getFileContents()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.getFileContents ' );
    return this.#fileContents;
   } // End function getFileContents

   getFileName()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.getFileName -> ' + this.#filename );
     return this.#filename;
   } // End function getFileName

   getLineNumber()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.getLineNumber -> ' + this.#lineNumber );
     return this.#lineNumber;
   } // End function getLineNumber

   getCurrentLine()
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.getCurrentLine -> ' + this.#lineNumber );
     this.#lineNumber = Math.max ( this.#lineNumber, 0) ;
     this.#lineNumber = Math.min ( this.#lineNumber, this.#fileContents.length ) ;
     let lineOfText = this.#fileContents [ this.#lineNumber ];
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.getCurrentLine -> ' + lineOfText );
     return lineOfText;
   } // End function getCurrentLine

   updateCurrentLine ( lineNumber, newLineOfText )
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.updateCurrentLine -> ' + this.#lineNumber + ' -> ' + newLineOfText );
     if ( lineNumber >= 0 && lineNumber < this.#fileContents.length )
     { this.#fileContents [ lineNumber ] = newLineOfText;
     } // End if
     else
     { console.log ( '--*** Unable to update Line Of text at lineNumber (' + lineNumber + ') is not in range' );
    } // End else
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.updateCurrentLine -> ' + newLineOfText );
     return newLineOfText;
   } // End function updateCurrentLine

   clearContents()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.clearContents' );
     this.#fileContents = [];
   } // End function clearContents

   gotoTop()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.gotoTop' );
     this.#lineNumber = -1;
   } // End function gotoTop

   gotoBottom()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.gotoBottom' );
     this.#lineNumber = this.#fileContents.length - 1;
   } // End function gotoBottom

   next()
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.next' );
     let text;
     if ( this.#fileContents.length >= this.#lineNumber )
     { this.#lineNumber++;
       text = this.#fileContents[this.#lineNumber];
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.next -> ' + text);
     return text;
   } // End function next

   previous()
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.previous' );
     let text;
     if ( this.#lineNumber > -1 )
     { text = this.#fileContents[this.#lineNumber];
       this.#lineNumber--;
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.previous -> ' + text);
     return text;
   } // End function previous

   popNext()
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.popNext' );
     this.#lineNumber = 0; 
     return this.#fileContents.shift();
   } // End function popNext

   loadTemplateFile ( filename )
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.loadTemplateFile -> ' + filename );
     this.#fileIO = this.#templateGlobalContext.getFileIO();
     this.#fileContents = this.#fileIO.synchronouslyReadFile ( filename );
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.loadTemplateFile -> ' + this.#fileContents.length );
     return this.#fileContents.length;
   } // End Function loadTemplateFile

   isEmpty ( )
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.isEmpty -> ' + (this.#fileContents.length === 0) );
     return this.#fileContents.length === 0;
   } // End function isEmpty

   isEof ( )
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.isEof');
     let localResult = true;
     if ( typeof this.#lineNumber !== 'undefined' && typeof this.#fileContents != 'undefined' )
     { localResult = this.#lineNumber >= this.#fileContents.length;
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.isEof -> ' + localResult);
     return  localResult;
   } // End function isEmpty

   notifyIsEof()
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.notifyIsEof');
     let metaEchoInfo  = this.#templateGlobalContext.getMetaSettings().get ( 'metaEchoInfo' );
     if ( metaEchoInfo )
     { let messageText = 'Template File/MACRO Eof encountered: ' + this.getFileName();
       this.#templateGlobalContext.consoleInfo ( messageText );
     } // End if
   } // End function notifyIsEof

   setLineNumber ( newLineNumber )
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.setLineNumber -> ' + newLineNumber );
     if ( !newLineNumber || newLineNumber < 0 )
     { newLineNumber = 0;
     } // End if
     if ( newLineNumber > this.#fileContents.length )
     { newLineNumber = this.#fileContents.length;
     } // End if
     this.#lineNumber = newLineNumber
     let lineOfText = this.getCurrentLine();
     this.#templateGlobalContext.consoleTrace ( 'Ending TemplateFile.setLineNumber -> "' + lineOfText + '"' );
     return lineOfText;
   } // End function setLineNumber

   setFileContents ( fileContent, newLineNumber )
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.setFileContents -> ' + newLineNumber );
     this.#fileContents = fileContent;
     this.setLineNumber ( newLineNumber );
     this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.setFileContents -> ' + this.#fileContents.length );
     return this.#fileContents.length;
   } // End Function setFileContents

   updateFileName ( newName )
   { this.#templateGlobalContext.consoleTrace ( 'Executing TemplateFile.updateFileName -> ' + newName );
     if ( newName )
     { this.#filename = newName;
     }
   return newName;
   } // End function updateFileName

   setSplice ( startingAt, arrayToSpliceIn )
   { this.#fileContents.splice ( startingAt, arrayToSpliceIn.length, ...arrayToSpliceIn );
   } // End setSplice


   toJSON()
   { this.#templateGlobalContext.consoleTrace ( 'Starting TemplateFile.toJSON');
     let jsonText
       =  "\n{\n"
          + "  \"fileIO\"                 : \"" + this.#fileIO + "\",\n"
          + "  \"fileContents\"           : \"" + JSON.stringify ( this.#fileContents, null, "\t" ) + "\",\n"
          + "  \"filename\"               : \"" + this.#filename + "\",\n"
          // + "  \"templateGlobalContext\"  : \"" + this.#templateGlobalContext.toJSON() + "\",\n"
          + "  \"lineNumber\"             : \"" + this.#lineNumber + "\"\n"
          +"}\n";
      this.#templateGlobalContext.consoleTrace ( 'Finishing TemplateFile.toJSON -> \n' + jsonText );
     return jsonText
   } // End function toJSON

} // End class TemplateFile

function unitTestProcessTemplate()
{ 
  console.log ( "--========== starting unitTestProcessTemplate ==========");
  const filename = "./Templates/example.template";
  let trace = false;
  console.log ( "===== Step 1.0" );
  let templateGlobalContext 
    = new TemplateGlobalContext
          ( '_',
            '#',
            process.cwd(),
            trace
          );
  
  let templateFile = new TemplateFile( filename, templateGlobalContext, trace );
  
  // try
  { templateFile.gotoTop();
    let lineCounter            = -1;
    let lineOfText             = '';

    console.log ( '====' + tdlUtils.RULER );
    while ( !templateFile.isEof() )
    { lineOfText               = templateFile.nextLine();
      lineCounter              = templateFile.getLineNumber();
      lineCounter              = templateFile.getLineNumber() + 1;
      console.log ( '--> ' + lineCounter + '] ' + lineOfText );
    } // End while
    console.log ( '===== Step 1.0');
    templateFile.gotoTop();
    lineOfText = templateFile.getCurrentLine();
    lineCounter = templateFile.getLineNumber();
    console.log ( '--> ' + lineCounter + '] ' + lineOfText );
    lineOfText = templateFile.nextLine();
    lineCounter = templateFile.getLineNumber();
    lineOfText = templateFile.previous();
    lineCounter = templateFile.getLineNumber();
    console.log ( '--> ' + lineCounter + '] ' + lineOfText );
    console.log ( '--- ' + templateFile.getFileName() ); 
  } // End try block
  //catch ( errorInfo )
  //{ console.log   ( '--*** ' + errorInfo );
  //} // End catch block
  console.log ( "--========== finishing unitTestProcessTemplate ==========");
} // End function unitTestProcessTemplate

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestProcessTemplate();
} // End if
