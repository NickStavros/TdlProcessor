/**
 * File: EnvironmentSettings.js
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
 * @class EnvironmentSettings
 * @description Contains the definitions for all the globally defined 
 * environment variables.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from "./TemplateGlobalContext.js";
import * as path             from 'path';

//===== Class Definition ======
export default class EnvironmentSettings
  { //===== Private
      /**
      * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
      * @type { TemplateGlobalContext }
      * @private
      */
      #templateGlobalContext;
      #environmentSettings;
      #reserveWords
           =   [ 'undefined',
                 'metaIndicator',
                 'platform',
                 'osVersion',
                 'osArchitecture',
                 'upDirectoryIndicator',
                 'pathSeparator',
                 'factoryName',
                 'parentDirectory',
                 'rootDirectory',
                 'templatePath',
                 'dataPath',
                 'outputPath',
                 'resultPath',
                 'templateName',
                 'templateFileExtension',
                 'outputFileName',
                 'outputFileExtension',
                 'resultFileName',
                 'resultExtension',
                 'suppressBlanks',
                 'expandVariables',
                 'blank'
               ];
                   

    //===== Constructors 
      constructor ( parentDirectory =  process.cwd(), templateGlobalContext )
      { if ( !templateGlobalContext )
        { console.log ( '--*** No TemplateGlobalContext provided to EnvironmentSettings, creating new local copy.' );
          templateGlobalContext = new TemplateGlobalContext();
        } // End if
        templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings Constructor' );
        this.#templateGlobalContext = templateGlobalContext;
        this.resetToDefault(parentDirectory);
        templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings Constructor' );
      } // End constructor

    //===== Getters
      getEnvironmentSettings ()
      { this.#templateGlobalContext.consoleTrace ( 'Executing getEnvironmentSettings' );
        return this.#environmentSettings;
      } // End function getEnvironmentSettings

      get ( key )
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.get -> ' + key );
        let localResult;
        localResult = this.#environmentSettings.get ( key );
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.get -> "' + localResult + '"' );
        return localResult;
      } // End function get

      #getRelativeDir ( fullDir, rootDir )
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.#getRelativeDir \n-> ' + fullDir + ', \n-> ' + rootDir );
        let localResult;
        localResult = fullDir.split ( rootDir )[0];
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.#getRelativeDir -> ' + localResult );
        return localResult;
      } // End function getRelativeDir
  
    //===== Setters
      //===== Set
      set ( key, value )
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.set -> "' + key + '", "' +  value + '"' );
        if ( key ) 
        { if ( key ==="parentDirectory" )
          { let templateFoundryRelDir
                  = this.#getRelativeDir
                      ( this.get ( 'rootDirectory' ), 
                        this.get ( 'parentDirectory' ) 
                      );
            this.setParentDirectory ( value, templateFoundryRelDir );
          } // End if
          else
          { this.#environmentSettings.set ( key, value );
          } // End else
        } // End if
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.set');
      } // End function set
    
      setParentDirectory ( parentDirectory = process.cwd() )
      { parentDirectory = parentDirectory || process.cwd();
        this.#templateGlobalContext.consoleTrace ( 'Starting setParentDirectory -> ' + parentDirectory );
        this.#environmentSettings.set ( "parentDirectory", parentDirectory );
        this.#environmentSettings.set ( "rootDirectory", parentDirectory  );
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.setParentDirectory' );
      } // End function setParentDirectory

    //===== Public
  
      delete ( key )
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.delete -> ' + key );
        let localResult = false;
        if ( ! this.isReservedWord ( key ) )
        { localResult = this.#environmentSettings.delete ( key );
        } // End if
        else
        { console.log ( '--*** Can not delete reserved word ' + key.trim() + ' value' );
        } // End else
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.delete -> ' + localResult );
        return localResult;
      } // End function delete
  
      has ( key )
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.has -> ' + key );
        let localResult = this.#environmentSettings.has ( key );
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.has -> ' + localResult );
        return localResult;
      } // End function set

      numberOfEntries ( )
      { this.#templateGlobalContext.consoleTrace ( 'Executing EnvironmentSettings.numberOfEntries -> ' + this.#environmentSettings.size );
        return this.#environmentSettings.size;
      } // End function set

      isReservedWord ( key )
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.isReservedWord -> ' + key );
        let localResult = false;
        if ( typeof key === 'string' )
        { key = key.trim();
          localResult = this.#reserveWords.includes ( key );
        } // nd if 
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.isReservedWord -> ' + localResult );
        return localResult;
      } // End function isReservedWord
  
      resetToDefault ( parentDirectory =  process.cwd() )
      { parentDirectory = parentDirectory || process.cwd();
        this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.resetToDefault -> ' + parentDirectory );
        if ( typeof this.#environmentSettings === "Map" ) 
        { this.#environmentSettings.clear();
        } // End if
        this.#environmentSettings 
          = new Map
                ( [ [ "platform",                    process.platform ],
                    [ "osVersion",                   process.version ],
                    [ "osArchitecture",              process.arch ],
                    [ "upDirectoryIndicator",        process.platform === 'win32' ? path.dirname('dummy') : '..' ],
                    [ "pathSeparator",               path.sep ],
                    [ "factoryName",                 "Template Factory" ],
                    [ "parentDirectory",             parentDirectory ],
                    [ "rootDirectory",               parentDirectory ],
                    [ "templatePath",                "Templates/" ],
                    [ "dataPath",                    "Data/" ],
                    [ "outputPath",                  "Results/" ],
                    [ "resultPath",                  "Results/" ],
                    [ "templateName",                "HelloWorld" ],
                    [ "templateFileExtension",       ".template" ],
                    [ "outputFileName",              "templateName" ],
                    [ "outputFileExtension",         ".csv" ],
                    [ "resultFileName",              "templateName" ],
                    [ "resultExtension",             ".sql" ],
                    [ "suppressBlanks",              "false" ],
                    [ "expandVariables",             "true" ],
                    [ "blank",                       " " ]
                  ]
                ); // End New
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.resetToDefault' );
      } // End function resetToDefault

      toJSON()
      { this.#templateGlobalContext.consoleTrace ( 'Starting EnvironmentSettings.toJSON' );
        let jsonText
          =  JSON.stringify ( Array.from ( this.#environmentSettings) , null, "\t" ) + "\",\n";
        this.#templateGlobalContext.consoleTrace ( 'Finishing EnvironmentSettings.toJSON ->\n' + jsonText );
        return jsonText;
      } // End function toJSON

  } // End Class EnvironmentSettings

  function testEnvironmentSettings()
  { console.log ( '--==== STEP : 1.0 ' );
    console.log ( '-- Create a new environmentSettings' );
    let environmentSettings = new EnvironmentSettings();
    console.log ( environmentSettings.getEnvironmentSettings() );
    console.log ( '--==== STEP : 1.1 ' );
    console.log ( '-- Test for reserve words' );
    console.log ( '-- "hello" is a reserve Word?                ' + environmentSettings.isReservedWord ( 'hello') );
    console.log ( '-- "parentDirectory" is a reserve Word?      ' + environmentSettings.isReservedWord ( 'parentDirectory') );
    console.log ( '-- "resultFileName" is a reserve Word?       ' + environmentSettings.isReservedWord ( 'resultFileName') );
    console.log ( '--==== STEP : 1.2 ' );
    console.log ( '-- modify a reserve "parentDirectory" to "/me"' );
    environmentSettings.set ( 'parentDirectory', '/me' );
    console.log ( environmentSettings.getEnvironmentSettings() );
    environmentSettings.set ( 'parentDirectory' );
    console.log ( environmentSettings.getEnvironmentSettings() );
    console.log ( '--==== STEP : 2.0 ' );
    console.log ( '-- modify a reserve "outputFileName" to "example"' );
    environmentSettings.set ( 'outputFileName', 'myNewClass' );
    environmentSettings.set ( 'outputFileExtension', '.cpp' );
    console.log ( environmentSettings.getEnvironmentSettings() );
    console.log ( '--==== STEP : 2.1 ' );
    console.log ( '-- add a new environment Variable "MAC Address"' );
    console.log ( '-- Number of Entries : ' + environmentSettings.numberOfEntries() );
    environmentSettings.set ( 'MAC Address', 'f8:e4:3b:5d:53:5c' );
    console.log ( '-- Has a MAC Address : ' + environmentSettings.has ( 'MAC Address' ) );
    environmentSettings.set ( 'OS', 'macOS' );
    environmentSettings.set ( 'version', '12.4' );
    console.log ( environmentSettings.getEnvironmentSettings() );
    console.log ( '-- Number of Entries : ' + environmentSettings.numberOfEntries() );
    console.log ( '-- delete "version"' );
    environmentSettings.delete ( 'version' );
    console.log ( '-- Number of Entries : ' + environmentSettings.numberOfEntries() );
    console.log ( environmentSettings.getEnvironmentSettings() );
    return;
    
  } // End Function testEnvironmentSettings

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  testEnvironmentSettings();
} // End if
