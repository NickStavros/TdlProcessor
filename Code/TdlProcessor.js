/**
 * File: TdlProcessor.js
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
 * @class TdlProcessor
 * @description is the main entry point into the TDL 
 * TemplateFoundry Template Processing
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

// ===== Imports =====
import fileSystem            from 'fs';
import { fileURLToPath }     from 'url';
import dotenv                from 'dotenv';
import * as TdlUtils         from './TdlUtils.js';
import InterpretTemplate     from './InterpretTemplate.js';
import path                  from 'path';
import TemplateGlobalContext from './TemplateGlobalContext.js';
import yargs                 from 'yargs';

// Call to load environment variables from a .env file into the process.env object in Node.js applications. 
dotenv.config ();

//===== Class Definition
class TdlProcessor 
{ //===== Private
    /**
     * Contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
     #templateGlobalContext
     #currentTdlEnvironment;
     #defaultTdlFileName;
     #defaultOutputFileName;
     #defaultSettingsFileName;
     #defaultVerboseMode;
     #defaultSeparator;
     #defaultUser;
     #tdlHomePath;
     #tdlTemplatePath;
     #tdlOutputPath;
     #tdlOutputExt;
     #tdlDataPath;
     #tdlStartTimestamp;
     #settingsContents;
     #FILE_NOT_FOUND;
  
  //===== Constructor
  /**
   * This is the default constructor for the TdlProcessor. It takes one
   * parameter, a instance of a TemplateGlobalContext. If it is null or empty
   * a local copy is created.
   * @param templateGlobalContext is an instance of TemplateGlobalContext
   * which contains a copy of the all the singletons used in the TDL
   * processor TemplateFOundry.
   */
  constructor ( templateGlobalContext ) 
  { if ( !templateGlobalContext )
    { templateGlobalContext = new TemplateGlobalContext();
      templateGlobalContext.consoleWarn ( '--*** No TemplateGlobalContext provided to TdlProcessor, creating new local copy.' );
    } // End if
    this.#templateGlobalContext = templateGlobalContext;
    this.#templateGlobalContext.consoleTrace ( 'Starting TDLProcessor Constructor' ) ;
    
    // Define the default values for the arguments
    this.#tdlHomePath               = this.loadOsEnvVariable ( "TDL_HOME",        process.cwd() );
    this.#tdlTemplatePath           = this.loadOsEnvVariable ( "TDL_TEMPLATE",    this.#tdlHomePath + "/Templates/", true );
    this.#defaultTdlFileName        = this.#tdlTemplatePath + "HelloWorld.tdl";
   // Define the Get the value of TDL_HOME
    this.#tdlOutputPath             = this.loadOsEnvVariable ( "TDL_OUTPUT",      this.#tdlHomePath + "/Output/", true );
    this.#tdlOutputExt              = this.loadOsEnvVariable ( "TDL_OUTPUT_EXT",  ".text", true );
    this.#tdlDataPath               = this.loadOsEnvVariable ( "TDL_DATA",        this.#tdlHomePath + "/Data/" , true );
    //Define the current timestamp
    this.#tdlStartTimestamp = new Date();

    // Define the default values for the arguments
    let defaultTdlFileParts         = path.parse ( this.#defaultTdlFileName )
    this.#defaultOutputFileName     = this.#tdlOutputPath + defaultTdlFileParts.name + this.#tdlOutputExt; // "HelloWorld.txt";
    this.#defaultSettingsFileName   = this.#tdlDataPath + "tdlSettings.json";
    this.#defaultVerboseMode        = false;
    this.#defaultSeparator          = '-';
    this.#defaultUser               = this.loadOsEnvVariable ( "USER", "anonymous", false ) ;
    this.#FILE_NOT_FOUND            = 34;

    // Setup the TemplateGlobalContext
    this.#templateGlobalContext     = new TemplateGlobalContext ();
    this.#templateGlobalContext.setTraceState ( this.#defaultVerboseMode ) ;
    this.#templateGlobalContext.consoleTrace ( 'Starting TDLProcessor' ) ;

    // Define the variables for the current environment
    this.#currentTdlEnvironment 
      =  { filePath: fileURLToPath ( import.meta.url ) ,
           tdlCodePath:      path.dirname ( fileURLToPath ( import.meta.url )  ) ,
           tdlFileName:      path.basename ( fileURLToPath ( import.meta.url )  ) ,
           tdlHomePath:      this.#tdlHomePath,
           tdlTemplatePath:  this.#tdlTemplatePath,
           tdlOutputPath:    this.#tdlOutputPath,
           tdlDataPath:      this.#tdlDataPath,
           tdlOutputExt:     this.#tdlOutputExt,
           user:             this.#defaultUser,
           inputFileName:    this.#defaultTdlFileName,
           outputFileName:   this.#defaultOutputFileName,
           settingsFileName: this.#defaultSettingsFileName,
           verboseMode:      this.#defaultVerboseMode,
           versionNumber:    this.getCurrentVersion (),
           startTimeStamp:   this.#tdlStartTimestamp.toString(),
           startYear:        this.#tdlStartTimestamp.getFullYear(),
           startMonth:       this.#tdlStartTimestamp.toLocaleString('en-US', { month: 'long' }),
           startDay:         this.#tdlStartTimestamp.getDate(),
           startHour:        this.#tdlStartTimestamp.getHours(),
           startMinute:      this.#tdlStartTimestamp.getMinutes(),
           startSecond:      this.#tdlStartTimestamp.getSeconds(),
           startTimeZone:    this.#tdlStartTimestamp.getTimezoneOffset()
        };
    this.#templateGlobalContext.getEnvironmentSettings().set ( "versionNumber",   this.getCurrentVersion () );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startTimeStamp",  this.#tdlStartTimestamp.toString() );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startYear",       this.#tdlStartTimestamp.getFullYear() );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startMonth",      this.#tdlStartTimestamp.toLocaleString('en-US', { month: 'long' })  );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startDay",        this.#tdlStartTimestamp.getDate() );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startHour",       this.#tdlStartTimestamp.getHours() );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startMinute",     this.#tdlStartTimestamp.getMinutes() );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startSecond",     this.#tdlStartTimestamp.getSeconds() );
    this.#templateGlobalContext.getEnvironmentSettings().set ( "startTimeZone",   this.#tdlStartTimestamp.getTimezoneOffset() );
    this.#templateGlobalContext.consoleTrace ( 'Finishing TDLProcessor Constructor' ) ;
  } // End constructor TdlProcessor

  /**
   * is a custom local method containing the main logic to process 
   * command-line arguments for the TdlProcessor.
   */
  // 
  processArguments ()
  { this.#templateGlobalContext.consoleTrace ( 'Starting processArguments' );
    // this.#templateGlobalContext.setTraceState ( true );
    let argv = this.parseCommandLineArgs ();
    if ( this.mapCommandLineArgsToVariables ( argv ) )
    { this.#templateGlobalContext.consoleInfo ( "Processing SETTINGS: '" + this.#currentTdlEnvironment.settingsFileName + "'" ) ;
      this.#settingsContents = this.loadSettings ( this.#currentTdlEnvironment.settingsFileName );
      let variableCounter = this.#templateGlobalContext.setGlobalSettings ( this.#templateGlobalContext, 'GLOBAL', this.#settingsContents, this.#defaultSeparator ) ;
      this.#templateGlobalContext.consoleInfo ( 'Global Settings Defined: ' + variableCounter ) ;
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing processArguments:\n' + this.toJSON () );
  } // End function processArguments

  //----- About
  /**
   * describes the details(i.e, help) onto the the console.log of the 
   * Template Foundry TDL Processor, and how to use it.
   * @param { string } defaultOutputFileName the file specification for the output file.
   * @param { string } defaultSettingsFileName the file specification for the settings file.
   * @param { string } defaultTdlFileName the file specification for the input TDL file.
   * @param { string } defaultUser the default name of the user generating the code.
   * @param { string } fileName is the current name of the script file. 
   */
  about ( fileName, defaultTdlFileName, defaultOutputFileName, defaultSettingsFileName, defaultUser )
  { this.#templateGlobalContext.consoleTrace ( 'Starting about' );
    console.log ( '-- About:' );
    console.log ( '--    ' + fileName);
    console.log ( '-- Description:' );
    console.log ( `--   Processes the <inputFileSpec> according to the rules of
                  the Template Definition language (TDL) and produces a new file specified in the <outputFileSpec>. 
                  It is also possible to setup the processing environment using JSON descriptions provided 
                  in a <setupFileSpec>`);
    console.log ( '-- Syntax:' );
    console.log ( '--    ' + fileName + ' --input <inputFileSpec> --output <outputFileSpec> --settings <settingsFileSpec> --verbose --about' );
    console.log ( '-- Where:' );
    console.log ( '--    <inputFileSpec>, -i(optional), --input(optional)    - Specify the <inputFileSpec>,   DEFAULT : ' + defaultTdlFileName );
    console.log ( '--    -o, --output   - Specify the <outputFileSpec>,  DEFAULT : ' + defaultOutputFileName );
    console.log ( '--    -s, --settings - Specify the <settingFileSpec>, DEFAULT : ' + defaultSettingsFileName);
    console.log ( '--    -u, --user     - Specify the <userName>,        DEFAULT : ' + defaultUser );
    console.log ( '--    -v, --verbose  - Request a verbose log,         DEFAULT : false' );
    console.log ( '--    -a, --about    - Request information about the ' +  fileName + ', DEFAULT: false' );
    console.log ( '--    -h, --help     = Request help information auto-generated for the ' + fileName + ', DEFAULT: false' );
    this.#templateGlobalContext.consoleTrace ( 'Finishing about' );
  } // End function about
  
  //----- checkFileExists
  /**
   * Check if the file specified at filepath actually exists.
   * @param { string } filePath the file specification of the file to verify existence.
   * @returns true if the filePath points to an existing file, otherwise false.
   */
  checkFileExists ( filePath )
  { this.#templateGlobalContext.consoleTrace ( 'Starting checkFileExists -> ' + filePath );
    let localResult = false;
    try
    { fileSystem.accessSync ( filePath, fileSystem.constants.F_OK );
      localResult = true;
    } // End try
    catch ( error ) 
    { localResult = false;
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing checkFileExists -> ' + localResult );
    return localResult;
  } // End function checkFileExists
  
  //----- doesFileExistOnSystem
  /**
   * checkFileExists 
   * @param { string } filePath the file specification of the file to verify existence.
   * @param { boolean } raiseError indicates an exception should be raised if it does not exit.
   * @returns true if the filePath points to an existing file, otherwise false.
   */
  doesFileExistOnSystem ( filePath, raiseError )
  { this.#templateGlobalContext.consoleTrace ( 'Starting doesFileExistOnSystem -> ' + filePath );
    let localResult = true;
    if ( this.checkFileExists ( filePath ) )
    { if ( ! raiseError )
      { this.#templateGlobalContext.consoleInfo ("File '" + filePath + "' already exists");
      } // End if
    } // End if
    else 
    { localResult = false;
      if ( raiseError ) 
      { this.#templateGlobalContext.consoleError ( this.#FILE_NOT_FOUND, "File '" + filePath + "' does not exist" );
      } // End if
      else
      { this.#templateGlobalContext.consoleWarn ( "File '" + filePath + "' does not exist" );
      } // End else
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing doesFileExistOnSystem -> ' + localResult );
    return localResult;
  } // End function doesFileExistOnSystem
  
  //----- fixArgument
  /**
   * ensures an argument values is a string. If it is an array, the values are joined
   * together with a space between the elements of the array. If it is a string, 
   * all leading and trailing are trimmed.
   * @param {*} value the argument to be "fixed"
   * @returns a string.
   */
  fixArgument ( value )
  { this.#templateGlobalContext.consoleTrace ( 'Starting fixArgument -> ' + value );
    if ( Array.isArray ( value ) )
    { value = value.join('');
    } // End if
    if ( typeof value === 'string' )
    { value = value.trim();
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing fixArgument -> ' + value );
    return value;
  } // End function fixArgument  
  
  //---- getAttributeInsensitive
  /**
   * is designed to retrieve the value of a specified attribute from an input object in a 
   * case-insensitive manner. 
   * @param {*} object 
   * @param {*} attributeName 
   * @returns the attribute that has been fixed according to the rules of the method. 
   */
  getAttributeInsensitive ( object, attributeName ) 
  { this.#templateGlobalContext.consoleTrace ( 'Starting getAttributeInsensitive -> \'' + attributeName + '\'' );
    let localResult;
    // Convert the attribute name and input object keys to lowercase
    attributeName = attributeName.toLowerCase().trim();
    const objectKeys = Object.keys(object).map((key) => key.toLowerCase().trim());
  
    // Check if the lowercase attribute name exists in the lowercase object keys
    if ( objectKeys.includes(attributeName ))
    { // Attribute exists, return its value
      localResult = object [ Object.keys ( object ).find ( key => key.toLowerCase().trim() === attributeName ) ];
    } // End if
  
    // Attribute not found, return undefined or any default value as needed
    if ( typeof localResult === 'object' )
    { const fileName = Object.keys(localResult)[0];
      const FileExtension = Object.keys(localResult[fileName])[0];
      localResult = fileName + "." + FileExtension;
    } // end if
    localResult = this.stringCoercion ( localResult );
    this.#templateGlobalContext.consoleTrace ( 'Finishing getAttributeInsensitive -> \'' + localResult + '\'' );
    return localResult;
  } // End function getAttributeInsensitive
  
  //----- getCurrentVersion
  /**
   * gets the current version number for the Template Foundry TDL Processor.
   * @returns a string containing the version number.
   */
  getCurrentVersion()
  { this.#templateGlobalContext.consoleTrace ( 'Starting getCurrentVersion' );
    let localResult = null;
    let packageInfo = { "version": "0.0.0" };
    try
    { const packageData = fileSystem.readFileSync( './package.json', 'utf8');
      packageInfo = JSON.parse ( packageData );
      localResult = packageInfo.version;
    } // End try
    catch ( error )
    { console.error('--*** Error reading/parsing the file:', error );
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing getCurrentVersion -> '  + localResult );
    return localResult;
  } // End function getCurrentVersion
  
  //----- loadOsEnvVariable
  /**
   * Retrieves the value of an environment variable, falling back 
   * to a default value if not defined.
   *
   * @param {string} variableName The name of the environment variable 
   * to retrieve.
   * @param {string} defaultValue The default value to use if the environment 
   * variable is not defined.
   * @returns {string} The value of the environment variable, or the 
   * default value if not defined.
   *
   * @example
   * ```javascript
   * const db_host = loadOsEnvVariable('DB_HOST', 'localhost');
   * console.log(db_host); // Prints the value of the DB_HOST environment
   * variable, or 'localhost' if not defined.
   * 
   *
   * @note
   * - If the `defaultValue` includes a path separator (`/` or `\`), 
   * it is treated as a file specification and resolved using `path.resolve`.
   * - Empty (`''`) values, `undefined`, and `null` are considered 
   * undefined environment variables.
   * - The function logs trace and info messages to the console 
   * using the provided `templateGlobalContext`.
   */
  loadOsEnvVariable ( variableName, defaultValue )
  { this.#templateGlobalContext.consoleTrace ( 'Starting loadOsEnvVariable -> ' + variableName);
    // Define the Get the value of tdlHomePath
    let localResult = defaultValue;
    try
    { if ( defaultValue.includes('/') || defaultValue.includes('\\') ) 
      { // It is a file specification
        localResult = path.resolve ( process.env [ variableName ] );
      } // End if
      else
      { // It is just a string
        let localEnvValue = process.env [ variableName ];
        if ( localEnvValue !== undefined && localEnvValue !== null && localEnvValue !== '' )
        { localResult = localEnvValue;
        } // End if
      } // End else
    } // End try
    catch ( error )
    { this.#templateGlobalContext.consoleInfo 
        ( "--+++ OS ENVIRONMENT variable '" + variableName +
        "' is not defined, using the default: '" + defaultValue + "'" 
        );
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing loadOsEnvVariable -> ' + variableName + ' : ', localResult );  
    return localResult
  } // End function loadOsEnvVariable

  //----- loadSettings
  /**
   * Reads and returns the contents of a settings file as a string.
   *
   * @param {string} settingsFileName The name of the settings file to load.
   * @returns {string} The contents of the settings file as a string.
   *
   * @throws {Error} If the settings file cannot be read for any reason.
   *
   * @example
   * ```javascript
   * const settings = loadSettings('my-settings.json');
   * const parsedSettings = JSON.parse(settings);
   *
   * console.log(parsedSettings.port); // Prints the port value from the settings file.
   * 
   *
   * @note
   * - The function uses the `#currentTdlEnvironment.settingsFileName` 
   * property to resolve the full path to the settings file.
   * - The function expects the settings file to be encoded in UTF-8.
   * - Any error encountered while reading the file will be thrown 
   * as an `Error` object.
   * - The function logs trace and error messages to the console 
   * using the provided `#templateGlobalContext`.
   */
  loadSettings  ( settingsFileName )
  { this.#templateGlobalContext.consoleTrace ( 'Starting loadSettings -> ' + settingsFileName );
    const absoluteSettingsFile = path.resolve ( this.#currentTdlEnvironment.settingsFileName ) ;
    let settingsContents = '';
    try 
    { settingsContents = fileSystem.readFileSync ( absoluteSettingsFile, 'utf8' ) ;
    } // End try
    catch  ( error )
    { this.#templateGlobalContext.consoleError ( "Reading SETTINGS as a file: '" + settingsFileName + "' Error: " + error.message ) ;
      process.exit ( error.errno ) ;
    } // End catch
    return settingsContents;
  } // End function loadSettings

  //----- mapCommandLineArgsToVariables
  /**
   * Parses command-line arguments and maps them to corresponding 
   * variables in the `#currentTdlEnvironment` object.
   *
   * @param {object} argv The command-line arguments object.
   * @returns {boolean} True if parsing was successful, false otherwise.
   *
   * @throws {Error} If an error occurs while processing arguments.
   *
   * @example
   * ```javascript
   * const parseResult = mapCommandLineArgsToVariables(argv);
   * if (parseResult) {
   *   // Use the `#currentTdlEnvironment` object for further processing
   * } else {
   *   // Handle errors
   * }
   * 
   *
   * ## Recognized arguments:
   *
   * - `--about`: Displays information about the program and exits.
   * - `--verbose`: Enables verbose logging.
   * - `--input`: Specifies the input TDL file path.
   * - `--output`: Specifies the output file path.
   * - `--settings`: Specifies the settings file path.
   * - `--user`: Specifies the user name.
   * - `--version`: Displays the program version and exits.
   *
   * ## Notes:
   *
   * - All paths are resolved relative to the `#tdlHomePath` property.
   * - Any leading dots (".") are trimmed from argument values.
   * - The function logs trace and info messages to the console 
   * using the provided `#templateGlobalContext`.
   * - The `input`, `output`, and `settings` arguments are case-insensitive.
   * - If both `--input` and the first positional argument are present, 
   * only the first positional argument is used as the input file path.
   */
  mapCommandLineArgsToVariables ( argv )
  { this.#templateGlobalContext.consoleTrace ( 'Starting mapCommandLineArgsToVariables' );
    let localResult = true;
    let inputFlagFound = false;

    try
    { if  ( argv.about )
      { this.#templateGlobalContext.consoleInfo ( `User specified: ${argv.about}` ) ;
        const { name, ext } = path.parse ( this.#currentTdlEnvironment.filePath );
        this.about 
          ( name + ext, 
            this.#defaultTdlFileName, 
            this.#defaultOutputFileName, 
            this.#defaultSettingsFileName,
            this.#defaultUser
          ); 
        process.exit();
      } // End if
      if  ( argv.verbose )
      { this.#templateGlobalContext.consoleInfo ( '-- Verbose mode enabled.' ) ;
        this.#currentTdlEnvironment.verboseMode = true;
        this.#templateGlobalContext.setTraceState ( true ) ;
        this.#templateGlobalContext.setInfoState ( true ) ;
      } // End if
    
      if  ( argv.input )
      { this.#templateGlobalContext.consoleInfo ( `File specification: ${argv.input}` ) ;
        let inputFlagFound              = true;
        let argumentValue               = this.getAttributeInsensitive ( argv, 'input' ) ;
        let inputTdlFileParts           = path.parse ( this.#defaultTdlFileName )
        let outputTdlFileParts          = path.parse ( this.#defaultOutputFileName )
        this.#defaultOutputFileName     = this.#tdlOutputPath + inputTdlFileParts.name + outputTdlFileParts.ext; // "HelloWorld.txt";
        argumentValue = this.#tdlHomePath + TdlUtils.trimLeft ( argumentValue.replace ( new RegExp ( this.#tdlHomePath, 'g' ) , '' ) .trim (), '.' ) ;
        this.#currentTdlEnvironment.inputFileName = this.fixArgument ( argumentValue ) ;
        this.doesFileExistOnSystem ( this.#currentTdlEnvironment.inputFileName, true ) ;
      } // End if
      else if ( argv._.length > 0 )
      { this.#templateGlobalContext.consoleInfo ( `File specification: ${argv._[0]}` );
        let argumentValue              = this.#tdlHomePath 
                                         + TdlUtils.trimLeft
                                             ( argv._[0].replace
                                                ( new RegExp ( this.#tdlHomePath, 'g' ), ''
                                                ).trim(), '.'
                                             );
        this.#currentTdlEnvironment.inputFileName = this.fixArgument(argumentValue);
        this.doesFileExistOnSystem(this.#currentTdlEnvironment.inputFileName, true);
        inputFlagFound = true; // Set the inputFlagFound to true to avoid further processing as the input filename has been handled
      }
    
      if  ( argv.output )
      { this.#templateGlobalContext.consoleInfo ( `Output path: ${argv.output}` ) ;
        let argumentValue = this.getAttributeInsensitive ( argv, 'output' ) ;
        argumentValue = this.#tdlHomePath + TdlUtils.trimLeft
          ( argumentValue.replace 
              ( new RegExp ( this.#tdlHomePath, 'g' ) , '' ) 
              .trim (), '.' 
          ) ;
        let inputFileParts = path.parse ( this.#currentTdlEnvironment.inputFileName );
        this.#currentTdlEnvironment.outputFileName = this.fixArgument ( argumentValue ) ;
        this.doesFileExistOnSystem ( this.#currentTdlEnvironment.outputFileName, false ) ;
      } // End if
    
      if  ( argv.settings )
      { this.#templateGlobalContext.consoleInfo ( `Settings path: ${argv.settings}` ) ;
        let argumentValue = this.getAttributeInsensitive ( argv, 'settings' ) ;
        argumentValue = this.#tdlHomePath + TdlUtils.trimLeft ( argumentValue.replace ( new RegExp ( this.#tdlHomePath, 'g' ) , '' ) .trim (), '.' ) ;
        this.#currentTdlEnvironment.settingsFileName = this.fixArgument ( argumentValue ) ;
        this.doesFileExistOnSystem ( this.#currentTdlEnvironment.settingsFileName, true ) ;
      } // End if
    
      if  ( argv.user )
      { this.#templateGlobalContext.consoleInfo ( `User specified: ${argv.user}` ) ;
        let argumentValue = this.getAttributeInsensitive ( argv, 'user' ) ;
        this.#currentTdlEnvironment.user = this.fixArgument ( argumentValue ) ;
      } // End if
    
      if  ( argv.version )
      { this.#templateGlobalContext.consoleInfo ( 'Version ' + argv.version + '.' ) ;
        this.#currentTdlEnvironment.versionNumber = argv.version;
      } // End if
    } // End try
    catch ( error )
    { localResult = false;
    } // End catch
    this.#templateGlobalContext.consoleTrace ( 'Finishing mapCommandLineArgsToVariables -> ' +  localResult);
    return localResult;
  } // End function mapCommandLineArgsToVariables

  //----- parseCommandLineArgs
  /**
   * Parses command-line arguments using `yargs` and populates them into an object.
   *
   * @returns {object} The parsed command-line arguments object.
   *
   * ## Recognized arguments:
   *
   * - `-i, --input <inputFileSpec>`: Specify the input TDL file path. (Optional)
   * - `-o, --output <outputFileSpec>`: Specify the output file path. (Optional)
   * - `-s, --settings <settingFileSpec>`: Specify the settings file path. (Optional)
   * - `-u, --user <userIdString>`: Specify a string associated with the 
   * user generating the code. (Optional)
   * - `-v, --verbose`: Enable verbose mode. (Default: false)
   * - `-a, --about`: Show the program's information.
   * - `-h, --help`: Show the help message for the current command.
   *
   * ## Notes:
   *
   * - All paths are resolved relative to the `#tdlHomePath` property.
   * - Any leading dots (".") are trimmed from argument values.
   * - The function logs trace and info messages to the console using 
   * the provided `#templateGlobalContext`.
   * - Options are case-insensitive.
   * - If both `-i` and the first positional argument are present, only 
   * the first positional argument is used as the input file path.
   * - The `coerce` function bound to `this.stringCoercion` is applied 
   * to string arguments for additional processing.
   */
  parseCommandLineArgs()
  { this.#templateGlobalContext.consoleTrace ( 'Starting parseCommandLineArgs -> ' + process.argv.slice ( 2 ) );
    const argv = yargs ( process.argv.slice ( 2 )  ) 
    .option ( 'i', {
      alias: 'input',
      demandOption: false,
      describe: 'Specify the input Template Definition Language  ( .tdl ), the -i or --input are optional, <inputFileSpec> can be the first argument. , DEFAULT: ' + this.#defaultTdlFileName,
      type: 'string',
      coerce: this.stringCoercion.bind ( this ) ,
    } ) 
    .option ( 'o', {
      alias: 'output',
      demandOption: false,
      describe: 'Specify the output path and file <outputFileSpec>, DEFAULT: ' + this.#defaultOutputFileName,
      type: 'string',
      coerce: this.stringCoercion.bind ( this ) ,
    } ) 
    .option ( 's', {
      alias: 'settings',
      demandOption: false,
      describe: 'Specify the output path and file <settingFileSpec>, DEFAULT: ' + this.#defaultSettingsFileName,
      type: 'string',
      coerce: this.stringCoercion.bind ( this ) ,
    } ) 
    .option ( 'u', {
      alias: 'user',
      demandOption: false,
      describe: 'Specify a string associated with the user generating the code <userIdString>, DEFAULT: ' + this.#defaultUser,
      type: 'string',
      coerce: this.stringCoercion.bind ( this ) ,
    } ) 
    .option ( 'v', {
      alias: 'verbose',
      describe: 'Enable verbose mode, DEFAULT: FALSE',
      type: 'boolean',
    } ) 
    .option ( 'a', {
      alias: 'about',
      describe: 'Show the \'about\' for this command',
      type: 'boolean',
    } ) 
    .option ( 'h', {
      alias: 'help',
      describe: 'Show the autogenerated help for the ' + this.#currentTdlEnvironment.inputFileName + ' command',
      type: 'boolean',
    } ) 
    .argv;
    this.#templateGlobalContext.consoleTrace ( 'Finishing parseCommandLineArgs ->\n' + JSON.stringify ( argv ) );
    return argv;
  } // End function parseCommandLineArgs

  //----- stringCoercion
  /**
   * Applies basic string processing to an argument.
   *
   * @param {any} arg The argument to be processed.
   * @returns {string} The processed string.
   *
   * @description
   * This function performs the following operations on the provided argument:
   *
   * 1. Converts the argument to a string if necessary.
   * 2. Trims any leading and trailing whitespace from the string.
   *
   * @note
   * - The function logs trace messages to the console using a provided context.
   * - An empty string, `undefined`, or `null` is considered an empty value.
   *
   * @example
   * ```javascript
   * const processedArgument = stringCoercion('  My argument with spaces  ');
   * console.log(processedArgument); // Outputs: "My argument with spaces"
   * ```
   */
  stringCoercion ( arg )
  { this.#templateGlobalContext.consoleTrace ( "Starting stringCoercion -> '" + arg + "'" );
    let localResult = arg;
    if (typeof arg === 'string') 
    { localResult = arg.trim();
    } // End if
    localResult = String( localResult ).trim();
    this.#templateGlobalContext.consoleTrace ( "Finishing stringCoercion -> '" + localResult + "'" );
    return localResult;
  } // End function stringCoercion

  //----- getCurrentTdlEnvironment
  /**
   * Retrieves the current TDL environment object.
   *
   * @returns {object} The current TDL environment object.
   *
   * @description
   * This function returns the internal object containing the current 
   * TDL environment settings. This object includes properties such as:
   *
   * - `inputFileName`: The path to the input TDL file.
   * - `outputFileName`: The path to the output file.
   * - `settingsFileName`: The path to the settings file.
   * - `user`: The user associated with the current code generation process.
   * - `verboseMode`: Whether verbose logging is enabled.
   * - `versionNumber`: The version of the TDL compiler being used.
   *
   * @note
   * - This function provides direct access to the internal `#currentTdlEnvironment` object.
   * - Modifying the returned object directly may have unintended consequences.
   * - Accessing individual properties of the environment object is preferred 
   * for improved readability and maintainability.
   *
   * @example
   * ```javascript
   * const environment = getCurrentTdlEnvironment();
   * console.log('Input file:', environment.inputFileName);
   * 
   */
  getCurrentTdlEnvironment ()
  { return this.#currentTdlEnvironment;
  } // End function getCurrentTdlEnvironment

  //----- updateEnvironmentVariables
  /**
   * Updates the process environment variables with the current TDL environment
   * settings.
   *
   * @description
   * This function iterates through all properties of the `#currentTdlEnvironment` 
   * object and sets the corresponding environment variables using the
   * `templateGlobalContext.getEnvironmentSettings()` object.
   *
   * @note
   * - Only own properties of the `#currentTdlEnvironment` are considered.
   * - Existing environment variables with the same name are overwritten.
   * - This function may have side effects for other processes accessing 
   * the environment variables.
   *
   * @example
   * ```javascript
   * this.updateEnvironmentVariables();
   * console.log(process.env.INPUT_FILE_NAME); 
   * // Outputs the path from the #currentTdlEnvironment.inputFileName
   * 
   */
  updateEnvironmentVariables ()
  { for ( const property in this.#currentTdlEnvironment )
    { if ( this.#currentTdlEnvironment.hasOwnProperty ( property ) ) 
      { const value = this.#currentTdlEnvironment [ property ];
        // console.log(`${property}: ${value}`);
        this.#templateGlobalContext.getEnvironmentSettings().set ( property, value  );
      } // End if
    } // End for property
  } // End function updateEnvironmentVariables
  
  
  //-----dumpTdlProcessorSetup
  /**
 * Prints detailed information about the current TDL processor setup.
 *
 * @param {object} currentTdlEnvironment The current TDL environment settings object.
 *
 * @description
 * This function logs various details about the current TDL processing environment, including:
 * - User information
 * - Path configurations
 * - Version information
 * - File names
 * - Runtime settings
 * - Time Stamps
 *
 * The purpose of this function is to provide transparency and allow inspection 
 * of the internal state of the TDL processor during runtime.
 *
 * @note
 * - The function temporarily enables trace logging around the actual printing for diagnostic purposes.
 * - Existing trace state is restored after printing.
 * - Logging is done using the provided `templateGlobalContext.console*` methods.
 * - This method is st the start of a TDL template interpretation. 
 *
 * @example
 * ```javascript
 * this.dumpTdlProcessorSetup(this.#currentTdlEnvironment);
 * // Prints a detailed overview of the current TDL environment settings.
 * 
 */
  dumpTdlProcessorSetup ( currentTdlEnvironment )
  { let traceState = this.#templateGlobalContext.getTraceState();
    this.#templateGlobalContext.setTraceState ( true );
    this.#templateGlobalContext.consoleTrace ( "Starting dumpTdlProcessorSetup" );
    this.#templateGlobalContext.consoleInfo ( 'Runtime TDL Environment Settings ------------------------------' );
    this.#templateGlobalContext.consoleInfo ( '  Current User                 : ' + currentTdlEnvironment.user );
    this.#templateGlobalContext.consoleInfo ( '  Current TDL Home Path        : ' + currentTdlEnvironment.tdlHomePath );
    this.#templateGlobalContext.consoleInfo ( '  Current Code Path            : ' + currentTdlEnvironment.tdlCodePath );
    this.#templateGlobalContext.consoleInfo ( '  Current TDL Templates Path   : ' + currentTdlEnvironment.tdlTemplatePath );
    this.#templateGlobalContext.consoleInfo ( '  Current TDL Output Path      : ' + currentTdlEnvironment.tdlOutputPath );
    this.#templateGlobalContext.consoleInfo ( '  Current TDL Data path        : ' + currentTdlEnvironment.tdlDataPath );
    this.#templateGlobalContext.consoleInfo ( '  Current TDL Data extension   : ' + currentTdlEnvironment.tdlOutputExt );
    this.#templateGlobalContext.consoleInfo ( '  Current File Path            : ' + currentTdlEnvironment.filePath );
    this.#templateGlobalContext.consoleInfo ( '  Version                      : ' + currentTdlEnvironment.versionNumber );
    this.#templateGlobalContext.consoleInfo ( '  Input File Name              : ' + currentTdlEnvironment.inputFileName );
    this.#templateGlobalContext.consoleInfo ( '  Output File Name             : ' + currentTdlEnvironment.outputFileName );
    this.#templateGlobalContext.consoleInfo ( '  Settings File Name           : ' + currentTdlEnvironment.settingsFileName );
    this.#templateGlobalContext.consoleInfo ( '  Verbose   Mode               : ' + currentTdlEnvironment.verboseMode );
    this.#templateGlobalContext.consoleInfo ( '  startTimeStamp               : ' + currentTdlEnvironment.startTimeStamp );
    this.#templateGlobalContext.consoleInfo ( '  startYear                    : ' + currentTdlEnvironment.startYear );
    this.#templateGlobalContext.consoleInfo ( '  startMonth                   : ' + currentTdlEnvironment.startMonth );
    this.#templateGlobalContext.consoleInfo ( '  startDay                     : ' + currentTdlEnvironment.startDay );
    this.#templateGlobalContext.consoleInfo ( '  startHour                    : ' + currentTdlEnvironment.startHour );
    this.#templateGlobalContext.consoleInfo ( '  startMinute                  : ' + currentTdlEnvironment.startMinute );
    this.#templateGlobalContext.consoleInfo ( '  startSecond                  : ' + currentTdlEnvironment.startSecond );
    this.#templateGlobalContext.consoleInfo ( '  startTimeZone                : ' + currentTdlEnvironment.startTimeZone );
    this.#templateGlobalContext.consoleInfo ( '---------------------------------------------------------------' );
    this.#templateGlobalContext.consoleTrace ( "Finishing dumpTdlProcessorSetup" );
    this.#templateGlobalContext.setTraceState ( traceState );
  } // End dumpTdlProcessorSetup
  
  //----- toJSON
  /**
   * Converts the current TDL environment settings to a JSON string.
   *
   * @returns {string} The JSON representation of the TDL environment settings. 
   * The string uses newlines and an indent of 2.
   * Literal strings are surrounded by double quotes (i.e., ").
   *
   * @description
   * This function iterates over all properties of the `#currentTdlEnvironment` object 
   * and constructs a JSON string containing those properties and their values. 
   * Each property is formatted with indentation and quotes for proper JSON structure.
   *
   * @note
   * - This function does not perform any deep object serialization. Only the 
   * current level of the `#currentTdlEnvironment` is included.
   * - The function logs trace messages to the console using the 
   * provided `#templateGlobalContext`.
   *
   * @example
   * ```javascript
   * const json = this.toJSON();
   * console.log(json); // Outputs the JSON representation of the TDL environment
   * 
   */
  toJSON ( )
  { this.#templateGlobalContext.consoleTrace ( "Starting toJSON" );
    let jsonText
      =  "\n{\n"
         + "  \"tdlEnvironment\" :\n"
         + "    { \"user\"                : \"" + this.#currentTdlEnvironment.user  + "\",\n"
         + "      \"homePath\"            : \"" + this.#currentTdlEnvironment.tdlHomePath + "\",\n"
         + "      \"codePath\"            : \"" + this.#currentTdlEnvironment.tdlCodePath  + "\",\n"
         + "      \"templatePath\"        : \"" + this.#currentTdlEnvironment.tdlTemplatePath + "\",\n"
         + "      \"outputPath\"          : \"" + this.#currentTdlEnvironment.tdlOutputPath + "\",\n"
         + "      \"dataPath\"            : \"" + this.#currentTdlEnvironment.tdlDataPath + "\",\n"
         + "      \"dataExtension\"       : \"" + this.#currentTdlEnvironment.tdlOutputExt + "\",\n"
         + "      \"filePath\"            : \"" + this.#currentTdlEnvironment.filePath  + "\",\n"
         + "      \"versionNumber\"       : \"" + this.#currentTdlEnvironment.versionNumber + "\",\n"
         + "      \"inputFileName\"       : \"" + this.#currentTdlEnvironment.inputFileName + "\",\n"
         + "      \"outputFileName\"      : \"" + this.#currentTdlEnvironment.outputFileName + "\",\n"
         + "      \"settingsFileName\"    : \"" + this.#currentTdlEnvironment.settingsFileName + "\",\n"
         + "      \"verboseMode\"         : \"" + this.#currentTdlEnvironment.verboseMode + "\",\n"
         + "      \"startTimeStamp\"      : \"" + this.#currentTdlEnvironment.startTimeStamp + "\",\n"
         + "      \"startYear\"           : \"" + this.#currentTdlEnvironment.startYear + "\",\n"
         + "      \"startMonth\"          : \"" + this.#currentTdlEnvironment.startMonth + "\",\n"
         + "      \"startDay\"            : \"" + this.#currentTdlEnvironment.startDay + "\",\n"
         + "      \"startHour\"           : \"" + this.#currentTdlEnvironment.startHour + "\",\n"
         + "      \"startMinute\"         : \"" + this.#currentTdlEnvironment.startMinute + "\",\n"
         + "      \"startSecond\"         : \"" + this.#currentTdlEnvironment.startSecond + "\",\n"
         + "      \"startTimeZone\"       : \"" + this.#currentTdlEnvironment.startTimeZone + "\",\n"
         + "    }\n"
         +"}\n"
    this.#templateGlobalContext.consoleTrace ( "Finishing toJSON" );
    return jsonText
  } // End function toJSON

  //----- startInterpretation
  /**
   * Starts the Template Foundry TDL interpretation process.
   *
   * @description
   * This function performs several crucial steps to run TDL interpretation:
   *
   * 1. **Echo Settings:** Enables echoing of comments, input, output, and information messages within the `templateGlobalContext`.
   * 2. **Process Arguments:** Handles any arguments passed to the program.
   * 3. **Show Context:** Displays the current TDL environment settings via `dumpTdlProcessorSetup` and its own JSON representation.
   * 4. **Environment Variables:** Updates process environment variables using the current TDL environment settings.
   * 5. **Open Output File:** Opens the specified output file based on the `--output` argument.
   * 6. **Start Interpretation:**
       * Creates an `InterpretTemplate` object.
       * Processes the template file specified by the input filename and writes the result to the output file using `processTemplate` method.
   * 7. **Error Handling:** Catches any errors during processing and logs them using `consoleWarn` and potentially rethrows them based on the `reThrowErrors` setting.
   * 8. **Finish:** Logs a completion message.
   *
   * @note
   * - This function relies on several other methods and objects within the program.
   * - Error handling allows suppression or propagation of errors based on configuration.
   *
   * @example
   * ```javascript
   * this.startInterpretation();
   * 
   */
  startInterpretation ()
  { this.#templateGlobalContext.consoleTrace ( "Starting startInterpretation " );
      
    // Setup the templateGlobalContext to echo comments, input and output
    this.#templateGlobalContext.setReThrowErrors ( true );
    this.#templateGlobalContext.getMetaSettings().set( 'metaEchoInput',   true );
    this.#templateGlobalContext.getMetaSettings().set( 'metaEchoOutput',  true );
    this.#templateGlobalContext.getMetaSettings().set( 'metaEchoComment', true );
    this.#templateGlobalContext.getMetaSettings().set( 'metaEchoInfo',    true );

    // Process the arguments passed
    this.processArguments();
    // Show the TDL Context
    this.dumpTdlProcessorSetup ( this.#currentTdlEnvironment ) ;
    this.#templateGlobalContext.consoleInfo ( "tdlEnvironment :\n" + this.toJSON() );
    this.updateEnvironmentVariables();
    
    // Setup a default output file based on the --output <outputFileSpec>
    this.#templateGlobalContext.getFileIO().openOutputFile ( this.#currentTdlEnvironment.outputFileName );
    this.#templateGlobalContext.consoleInfo ( "Start interpreting input file  -> " + this.#currentTdlEnvironment.inputFileName );
    this.#templateGlobalContext.consoleInfo ( "Start interpreting output file -> " + this.#currentTdlEnvironment.outputFileName );

    // Create an interpretTemplate object by instantiated the InterpretTemplate
    try
    { let interpretTemplate = new InterpretTemplate ( this.#templateGlobalContext );
      interpretTemplate.processTemplate
        ( this.#currentTdlEnvironment.inputFileName, 
          this.#currentTdlEnvironment.outputFileName 
        );
      this.#templateGlobalContext.consoleInfo ( "---- calling interpretTemplate.processTemplate " );
    } // End try block
    catch ( errorInfo )
    { this.#templateGlobalContext.consoleWarn   ( errorInfo );
      if ( this.#templateGlobalContext.getReThrowErrors() ) 
       { this.#templateGlobalContext.consoleError ( errorInfo );
       } // End if
     } // End catch block
    console.log ( "--========== Finishing startInterpretation ==========");
    
  } // End function startInterpretation

} // End TdlProcessor

//===== Exports
export default TdlProcessor;

//===== Testing =====
function unitTestCursor()
{ let templateGlobalContext;
  if ( !templateGlobalContext )
  { templateGlobalContext = new TemplateGlobalContext();
    templateGlobalContext.consoleWarn ( '--*** No TemplateGlobalContext provided to TdlProcessor, creating new local copy.' );
  } // End if
  // Create an instance of TdlProcessor
  const tdlProcessor = new TdlProcessor ( templateGlobalContext );
  // Call the processArguments() method
  try
  { tdlProcessor.startInterpretation();
  } // End try
  catch ( error )
  { console.log ( "--++ Testing terminated" );
    // Print out the error details
    if ( error instanceof Error )
    { console.log ( "--*** Error Message: ", error.message );
      if ( 'errno' in error )
      {  console.log("Error Number (errno): ", error.errno);
      } // End if
      if ( error.errno < 0 )
      { console.log("Stack Trace: ", error.stack);
      } // End if
    }  // End instance of Error
    else
    { console.log ( "Caught a non-Error object: ", error );
    } // End else
  } // End catch

} // End unitTestCursor
 
/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestCursor();
} // End if
