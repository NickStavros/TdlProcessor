/**
 * File: FileIO.js
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
 * @class FileIO
 * @description contains the methods used to access the file system.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import * as fileSystem                from 'fs';
import path                           from 'path';
import TemplateGlobalContext          from "./TemplateGlobalContext.js";

//===== Class Definition =====
export default class FileIO
{ //===== Private
   /**
      * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
      * @type { TemplateGlobalContext }
      * @private
      */
     #templateGlobalContext;
      
  #defaultEncoding = 'utf-8';
  #syncOutputStack = [];

  //===== Constructors 
  constructor ( defaultEncoding = 'utf-8',  templateGlobalContext )
  { if ( !templateGlobalContext )
    { console.log ( '--*** No TemplateGlobalContext provided to FileIO, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    templateGlobalContext.consoleTrace ( 'Starting FileIO Constructor' );
    this.#templateGlobalContext = templateGlobalContext;
    this.#defaultEncoding = defaultEncoding;
    templateGlobalContext.consoleTrace ( 'Finishing FileIO Constructor' );
  } // End constructor

  getTemplateGlobalContext()
  { return this.#templateGlobalContext;
  } // End function TemplateGlobalContext

  synchronouslyReadFile ( filename, splitTheContent )
  { this.#templateGlobalContext.consoleTrace
      ( 'Starting FileIO.synchronouslyReadFile -> ' + filename );
    let fileContents = null;
    if ( typeof splitTheContent === 'undefined' )
    { splitTheContent = true;
    } // End if
    try
    { fileContents
        = fileSystem.readFileSync
          ( filename, 
            this.#defaultEncoding
          );
    } // End Try
    catch ( error )
    { let errorMessage = '--*** Unable to open filename: "' + filename + '"';
      console.log ( errorMessage );
      this.#templateGlobalContext.consoleTrace 
        ( 'File read error in synchronouslyReadFile -> ' + error.message );
       fileContents = null;  // Ensure null is explicitly set on failure
      // throw errorMessage;
    } // End catch
    if ( splitTheContent  && fileContents !== null )
    { fileContents = fileContents.split(/\r?\n/);
    } // End if
    // console.log ( fileContents ); // A string array of statements
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.synchronouslyReadFile' );
    return fileContents;
  } // End synchronouslyReadFile

  createDir ( directoryPath )
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.createDir -> ' + directoryPath );
    let localResult = false;
    if ( typeof directoryPath !== 'string' || directoryPath.length <= 0 )
    { let errorMessage = '--*** The filePath must be a string and have a length greater than 0.';
      console.log ( errorMessage );
      localResult = false;
    } // End else if
    try
    { fileSystem.mkdirSync ( directoryPath, { recursive: true } );
      localResult = true;
    } // End Try
    catch ( error )
    { let errorMessage = '--*** Error encountered trying to make the directory path\n--***+ ' + error;
      console.log ( errorMessage );
      localResult = true;
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.createDir -> ' + localResult );
    return localResult;
  } // End function createDir

  openOutputFile ( filePath, fileAccessMode )
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.openOutputFile -> ' + filePath );
    let localResult = true;
    if ( typeof filePath !== 'string' || filePath.length <= 0 )
    { let errorMessage = 'The filePath must be a string and have a length greater than 0.';
      this.#templateGlobalContext.consoleWarn ( errorMessage );
      localResult = false;
    } // End else if
    else if ( typeof fileAccessMode === 'undefined' || fileAccessMode.trim().length <=0 )
    { fileAccessMode = 0o765;
      this.#templateGlobalContext.consoleTrace ( 'fileAccessMode defaulted to: ' + fileAccessMode );
    } // End else
    if ( localResult )
    { try 
      { let directoryPath = path.dirname ( filePath );
        let directoryPathCreate = this.createDir ( directoryPath );
        if ( ! directoryPathCreate )
        { let errorMessage = '--*** directoryPath "' + directoryPath + '" not created!';
          console.log ( errorMessage ) ;
        } // End if 
        let fileDescriptor = fileSystem.openSync
          ( filePath,
            'w', 
            fileAccessMode
          );
        this.#syncOutputStack.push ( [ fileDescriptor, 0, 'RUNNING' ] );
      } // End try
      catch ( error ) 
      { let errorMessage = '--*** Unable to openOutputFile filePath "' + filePath + '"';
        console.log ( errorMessage );
        console.log ( '--*** ' + error );
        localResult = false;
      } // End catch
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.openOutputFile -> ' + localResult );
    return localResult;
  } // End openOutputFile

  closeOutputFile ( )
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.closeOutputFile' );
    let localResult = true;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 ) 
    { try 
      { let fileDescriptor = this.#syncOutputStack [ this.getCurrentOutputFile() ];
        fileSystem.closeSync ( fileDescriptor[0] );
        this.#syncOutputStack.pop();
      } // End try
      catch ( error ) 
      { let errorMessage = '--*** Unable to close file';
        console.log ( errorMessage );
        console.log ( '--*** ' + error );
        localResult = false;
      } // End catch
    } // End if
    else
    { let errorMessage = '--*** There are no open output files to close.';
      console.log ( errorMessage );
      localResult = false;
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.closeOutputFile -> ' + localResult );
    return localResult;
  } // End openOutputFile

  numberOfLines ( )
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.numberOfLines' );
    let numberOfLines = 0;
    let foundErrors = false;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 ) 
    { let fileDescriptor = this.#syncOutputStack [ this.getCurrentOutputFile() ];
      numberOfLines = fileDescriptor[1];
    } // End if
    else
    { let errorMessage = '--*** There are no open output files to provide count for.';
      console.log ( errorMessage );
      foundErrors = false;
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.numberOfLines -> ' + numberOfLines );
    return numberOfLines;
  } // End function numberOfLines

  isOutputOpen()
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.isOutputOpen' );
    let localResult = false;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 ) 
    { localResult = true;
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.isOutputOpen -> ' + localResult);
    return localResult;
  } // End function isOutputOpen

  pauseOutputFile()
  { this.#templateGlobalContext.consoleTrace ( 'Executing FileIO.pauseOutputFile' );
    if ( this.isOutputOpen() )
    { this.#syncOutputStack [ this.getCurrentOutputFile()][2] = 'PAUSED';
    } // End if
  } // End function pauseOutputFile

  resumeOutputFile()
  { this.#templateGlobalContext.consoleTrace ( 'Executing FileIO.resumeOutputFile' );
    if ( this.isOutputOpen() )
    { this.#syncOutputStack [ this.getCurrentOutputFile()][2] = 'RUNNING';
    } // End if
  } // End function pauseOutputFile
  
  isOutputRunning()
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.isOutputRunning' );
    let localResult = false;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 ) 
    { localResult = ( this.#syncOutputStack [ this.getCurrentOutputFile()][2] === 'RUNNING' );
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.isOutputRunning -> ' + localResult);
    return localResult;
  } // End function isOutputRunning

  isOutputPaused()
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.isOutputPaused' );
    let localResult = false;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 ) 
    { localResult = ( this.#syncOutputStack [ this.getCurrentOutputFile()][2] === 'PAUSED' );
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.isOutputPaused -> ' + localResult);
    return localResult;
  } // End function isOutputRunning

  getCurrentOutputFile()
  { this.#templateGlobalContext.consoleTrace ( 'Executing FileIO.getCurrentOutputFile -> ' + this.#syncOutputStack.length );
    let localResult;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 ) 
    { localResult = this.#syncOutputStack.length - 1;
    } // End if
    else
    { let errorMessage = '--*** There are no open output files.';
      console.log ( errorMessage );
    } // End else
    return localResult;
  } // End function getCurrentOutputFile

  putToFile ( textToWrite )
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.putToFile -> "' + textToWrite + '"' );
    let localResult = 0;
    if ( this.#syncOutputStack !== 'undefined' && this.#syncOutputStack.length > 0 )
    { try 
      { if ( this.isOutputRunning() )
        { let fileDescriptor = this.#syncOutputStack [ this.getCurrentOutputFile() ];
          fileSystem.appendFileSync( fileDescriptor[0], textToWrite, this.#defaultEncoding );
          fileDescriptor[1]++;
          localResult = fileDescriptor[1];
          this.#syncOutputStack[this.getCurrentOutputFile() ] = fileDescriptor;
        } // End if
      } // End try
      catch ( error ) 
      { let errorMessage = '--*** Unable to append to current output file';
        console.log ( errorMessage );
        console.log ( '--*** putToFile.error: ' + error );
        localResult = false;
      } // End catch
    }
    else
    { let errorMessage = '--*** There are no open output files to put data into.';
      console.log ( errorMessage );
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.putToFile -> ' + localResult );
  } // End putToFile
  
  putLineToFile ( textToWrite )
  { this.#templateGlobalContext.consoleTrace ( 'Executing FileIO.putLineToFile -> "' + textToWrite + '"' );
    this.putToFile ( textToWrite + '\n');
  } // End function putLineToFile
  
  putTextToFile ( textToWrite )
  { this.#templateGlobalContext.consoleTrace ( 'Executing FileIO.putLineToFile -> "' + textToWrite + '"' );
    this.putToFile ( textToWrite );
  } // End function putTextToFile
  
  asynchronouslyReadFile ( fileName )
  {  this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.asynchronouslyReadFile -> ' + fileName );
     return new Promise ( ( resolve, reject ) =>
      {
        fileSystem.readFile 
          ( fileName, 
            this.#defaultEncoding, 
            function ( readError, dataFromFile )
            { if ( readError ) 
              { return reject (readError );
              } // End if error
              console.log ( "-- fileName : " + fileName );
              console.log ( dataFromFile )
              resolve();
           } // End readfile function
         )
        this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.asynchronouslyReadFile' );
      } // End arrow function
    );
  } // End function asynchronouslyReadFile

  toJSON()
  { this.#templateGlobalContext.consoleTrace ( 'Starting FileIO.toJSON');
    let jsonText
      =  "\n{\n"
         + "  \"defaultEncoding\"                 : \"" + this.#defaultEncoding + "\"\n"
         +"}\n";
    this.#templateGlobalContext.consoleTrace ( 'Finishing FileIO.toJSON ->\n' + jsonText );
    return jsonText
  } // End function toJSON
  
} // End class FileIO


function testFileIO()
{ let templateGlobalContext = new TemplateGlobalContext();
  //let resultOfScan = [ '', '', '' ]; 
  console.log ( "-- ========== testFileIO Starting ==========" );
  console.log ( "===== Step 0.0 - synchronized writing" );
  let fileIO = new FileIO ( 'utf-8', templateGlobalContext );
  templateGlobalContext.setTraceState ( false );
  let fileName = "./Data/MyNewCode.txt";
  console.log ( '#####  100 isOutputRunning : ' + fileIO.isOutputRunning() );
  console.log ('#### path: ' +  path.dirname (fileName  )  );
  fileIO.openOutputFile (  fileName );
  console.log ( '#####  200 isOutputRunning : ' + fileIO.isOutputRunning() );
  console.log ( '#####  300 isOutputPaused : ' + fileIO.isOutputPaused() );
  fileIO.putLineToFile ( 'Hello World 190xxx' );
  fileIO.pauseOutputFile();
  console.log ( '#####  400 isOutputPaused : ' + fileIO.isOutputPaused() );
  fileIO.putLineToFile ( '  Hello World 191 YYY' );
  fileIO.resumeOutputFile();
  console.log ( '#####  500 isOutputPaused : ' + fileIO.isOutputPaused() );
  fileIO.putLineToFile ( '    Hello World 192' );
  console.log ( '-- Number of Lines: ' + fileIO.numberOfLines ( ) );
  //fileIO.closeOutputFile ( );
  templateGlobalContext.setTraceState ( true );
  fileIO.createDir ( './myStuff/yourStuff/ourStuff' );
  fileName = "./Result/sql//MyNewCode.sql";
  console.log ('#### path: ' +  path.dirname (fileName  )  );
  templateGlobalContext.setTraceState ( false );
  fileName = './Results/sql/CREBAS.SQL';
  fileIO.createDir ( fileName );

  return;
  // fileName = './Templates/loopExample.template';
  console.log ( "===== Step 1.0" );
  console.log ( fileIO.synchronouslyReadFile ( fileName ) );
  console.log ( "===== Step 2.0" );
  console.log ( "===== Step 2.1" );
  console.log ( fileIO.asynchronouslyReadFile ( fileName ) );
  console.log ( "===== Step 2.2" );
  console.log ( fileIO.asynchronouslyReadFile ( fileName ) );
  console.log ( "===== Step 2.3" );
  console.log ( fileIO.asynchronouslyReadFile ( fileName ) );
  console.log ( "-- ========== testFileIO Finishing ==========" );
} // End testFileIO

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  testFileIO();
} // End if