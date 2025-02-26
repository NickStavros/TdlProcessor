/**
 * File: MetaSettings.js
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
 * @class MetaSettings
 * @description defines and manages the Meta-Settings used with the TDL.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from "./TemplateGlobalContext.js";

//===== Class Definition =====
export default class MetaSettings
  { //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #metaSettings;
    #metaSettingsArr;
    #cmdVarReserveWord
          = [ 'undefined',
               'metaIndicator',
               'metaCommandIndicator',
               'metaMacroStart',
               'metaMacroEnd',
               'metaVarStart',
               'metaVarEnd',
               'metaHostCmd',
               'metaCommentIndicator',
               'metaCommentStart',
               'metaCommentEnd',
               'metaLineContinue',
               'metaTemplateLiteral',
               'metaConditionalOp', 
               'metaConditionalDiv'
            ];          
    #stateVarReserveWord
          = [ 'metaEchoInput',
              'metaEchoOutput',
              'metaEchoComment',
              'metaEchoInfo',
              'metaEchoMacro',
              'verboseOutput',
              'diagnostics'
           ];
      #reserveWords
        = this.#cmdVarReserveWord.concat ( this.#stateVarReserveWord );

    //===== Constructors 
      constructor ( metaIndicator = '_', templateGlobalContext )
      { if ( !templateGlobalContext )
        { console.log ( '--*** No TemplateGlobalContext provided to MetaSettings, creating new local copy.' );
          templateGlobalContext = new TemplateGlobalContext();
        } // End if
        this.#templateGlobalContext = templateGlobalContext;
        this.#templateGlobalContext.consoleTrace ( 'Starting MetaSettings Constructor' );
        this.#templateGlobalContext = templateGlobalContext;
        this.resetToDefault ( metaIndicator );
        this.#templateGlobalContext.consoleTrace (  'Finishing MetaSettings Constructor' );
      } // End constructor

    //===== Getters
      get ( key )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.get -> ' + key );
        let localResult = this.#metaSettings.get ( key );
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.get -> ' + localResult );
        return this.#metaSettings.get ( key );
      } // End function get
    
      getMetaIndicator()
      { this.#templateGlobalContext.consoleTrace ( ' Executing MetaSettings.getMetaIndicator');
        return this.#metaSettings.get("metaIndicator");
      } // End function getMetaIndicator

      getMetaIndicator()
      { this.#templateGlobalContext.consoleTrace ( ' Executing MetaSettings.getMetaIndicator');
        return this.#metaSettings.get("metaIndicator");
      } // End function getMetaIndicator

      getMetaSettings ()
      { this.#templateGlobalContext.consoleTrace ( ' Executing MetaSettings.getMetaSettings');
        return this.#metaSettings;
      } // End function getMetaSettings

      getMetaSettingsArr ()
      { this.#templateGlobalContext.consoleTrace ( ' Executing MetaSettings.getMetaSettings');
        return this.#metaSettingsArr;
      } // End function getMetaSettings
  
      getMetaSettingByKey ( keyValue )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.getMetaSettingByKey -> ' + keyValue );
        const localKeyValue = keyValue;
        const filteredArr
          = this.#metaSettingsArr.filter
                ( function ( [ key, value ] )
                  { return key === ( localKeyValue );
                  }
               );
        if ( filteredArr )
        { this.#templateGlobalContext.consoleTrace ( "key: " + Object.entries   ( filteredArr )[0][0] );
          this.#templateGlobalContext.consoleTrace ( "value: " + Object.entries ( filteredArr )[0][1] );
        } // End if
        else
        { filteredArr = undefined;
        } // End else
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.getMetaSettingByKey -> ' + filteredArr );
        return filteredArr;
      } // End function getMetaCommandByKey

    //===== Setters
      set ( key, value )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.set -> ' + key + ', ' + value );
        if ( key === 'metaIndicator' )
        { this.setNewMetaIndicator ( value );
          this.hardSet ( key, value );
        } // End if 
        else
        { this.hardSet ( key, value );
        } // End else
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.set' );
      } // End function set

      hardSet ( key, value )
      { if ( this.isStateVariable ( key ) > 0 )
        { value = Boolean ( value );
        } // End if
        this.#metaSettings.set ( key, value );
      } // End function hardSet

      setNewMetaIndicator ( newMetaIndicator ) 
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.setNewMetaIndicator -> ' + newMetaIndicator  );
        let origMetaIndicator = this.#metaSettings.get("metaIndicator");
        if ( newMetaIndicator !== origMetaIndicator  )
        { this.swapMetaCommandIndicator ( 'metaCommandIndicator', newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaVarStart' ,        newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaMacroStart' ,      newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaMacroEnd' ,        newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaHostCmd' ,         newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaCommentIndicator', newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaCommentStart',     newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaCommentEnd',       newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaLineContinue',     newMetaIndicator );
          this.swapMetaCommandIndicator ( 'metaTemplateLiteral',  newMetaIndicator );
        } // End if
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.setNewMetaIndicator '  );
      } // End function setNewMetaIndicator

      swapMetaCommandIndicator ( metaSettingName, newMetaCommandIndicator )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.swapMetaCommandIndicator -> ' + metaSettingName + ', ' + newMetaCommandIndicator  );
        let originalMetaIndicator = this.#metaSettings.get ( 'metaIndicator' );
        let originalMetaSetting   = this.#metaSettings.get ( metaSettingName );
        let rootMetaSettingName   = originalMetaSetting.substring ( originalMetaIndicator.length );
        this.#metaSettings.set ( metaSettingName, newMetaCommandIndicator + rootMetaSettingName );
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.swapMetaCommandIndicator -> ' + metaSettingName + ', ' + newMetaCommandIndicator  );
      } // End function swapMetaCommandIndicator

    //===== Public

      isReservedWord ( key )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.isReservedWord -> ' + key );
        key = key.trim();
        let localResult = this.#reserveWords.includes ( key ) > 0;
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.isReservedWord -> ' + localResult );
        return localResult;
      } // End function isReservedWord

      isStateVariable ( key )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.isStateVariable -> ' + key );
        key = key.trim();
        let localResult = this.#stateVarReserveWord.includes ( key ) > 0;
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.isStateVariable -> ' + localResult );
        return localResult;
      } // End function isStateVariable

      delete ( key )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.delete -> ' + key );
        let localResult = false;
        if ( ! this.isReservedWord ( key ) )
        { localResult = this.#metaSettings.delete ( key );
        } // End if
        else
        { console.log ( '--*** Can not delete reserved word ' + key.trim() + ' value' );
        } // End else
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.delete -> ' + localResult );
      } // End function delete

      has ( key )
      { this.#templateGlobalContext.consoleTrace ( ' Executing MetaSettings.has -> ' + key );
        let localResult;
        localResult =  this.#metaSettings.has ( key );
        return localResult;
      } // End function set

      numberOfEntries ( )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.numberOfEntries' );
        let localResult;
        localResult = this.#metaSettings.size;
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.numberOfEntries -> ' + localResult );
        return localResult;
      } // End function set

      resetToDefault ( newMetaIndicator = '_' )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.resetToDefault' );
        newMetaIndicator = newMetaIndicator?.trim();
        newMetaIndicator = ( newMetaIndicator || '_' );
        newMetaIndicator = newMetaIndicator?.trim();
        if ( !newMetaIndicator )
        { newMetaIndicator = newMetaIndicator || '_';
        } // End if
        this.#metaSettings  = new Map();
        this.resetMetaIndicators ( newMetaIndicator );
        this.resetMetaFlags();
        this.resetMetaSettingArray();
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.resetToDefault' );
      } // End function resetToDefault

      resetMetaIndicators ( metaIndicator )
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.resetMetaIndicators' );
        this.#metaSettings.set ( 'undefined',             undefined );
        this.#metaSettings.set ( 'metaIndicator',         metaIndicator         );
        this.#metaSettings.set ( 'metaCommandIndicator',  metaIndicator + '#'   );
        this.#metaSettings.set ( 'metaMacroStart' ,       metaIndicator + '{'   );
        this.#metaSettings.set ( 'metaMacroEnd'   ,       metaIndicator + '}'   );
        this.#metaSettings.set ( 'metaVarStart' ,         metaIndicator + '&'   );
        this.#metaSettings.set ( 'metaVarEnd'   ,         '.'                   );
        this.#metaSettings.set ( 'metaHostCmd' ,          metaIndicator + '<'   );
        this.#metaSettings.set ( 'metaCommentIndicator',  metaIndicator +'//'   );
        this.#metaSettings.set ( 'metaCommentStart',      metaIndicator +'/*'   );
        this.#metaSettings.set ( 'metaCommentEnd',        metaIndicator +'*/'   );
        this.#metaSettings.set ( 'metaLineContinue',      metaIndicator +'\\'   );
        this.#metaSettings.set ( 'metaTemplateLiteral',   metaIndicator +'\`'   );
        this.#metaSettings.set ( 'metaConditionalOp',     metaIndicator +'\?'   );
        this.#metaSettings.set ( 'metaConditionalDiv',    metaIndicator +'\:'   );
        this.#metaSettings.set ( 'PSEUDO_ELEMENT',        '::'                  );
        this.#metaSettings.set ( 'RULER',                 
        "....:....1....:....2....:....3....:....4....:....5....:....6....:....7....:....8....:....9....:....1"
        );
        this.resetMetaSettingArray();
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.resetMetaIndicators' );
        
      } // End function resetMetaIndicators

      resetMetaFlags()
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.resetMetaFlags' );
        this.#metaSettings.set ( 'metaEchoInput',         true  );
        this.#metaSettings.set ( 'metaEchoOutput',        true  );
        this.#metaSettings.set ( 'metaEchoComment',       false );
        this.#metaSettings.set ( 'metaEchoInfo',          true  );
        this.#metaSettings.set ( 'metaEchoMacro',         false );
        this.#metaSettings.set ( 'verboseOutput',         false );
        this.#metaSettings.set ( 'diagnostics',           false );
        this.resetMetaSettingArray();
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.resetMetaFlags' );
      } // End function resetFlags

      resetMetaSettingArray()
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.resetMetaSettingArray' );
        this.#metaSettingsArr = Array.from ( this.#metaSettings );
        this.#templateGlobalContext.consoleTrace ( ' Finishing MetaSettings.resetMetaSettingArray' );
      } // End function resetMetaSettingArray

      toJSON()
      { this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.toJSON' );
        let jsonText
          =  JSON.stringify ( Array.from ( this.#metaSettings) , null, "\t" ) + "\",\n";
          this.#templateGlobalContext.consoleTrace ( ' Starting MetaSettings.toJSON\n' + jsonText );
        return jsonText
      } // End function toJSON

  } // End Class metaSettings

  function unitTestMetaSettings()
  { console.log ( '--==== STEP : 1.0 ' );
    console.log ( '-- Create a new MetaSettings' );
    let metaSettings = new MetaSettings () ;
    console.log ( metaSettings.getMetaSettings() );
    console.log ( '--==== STEP : 1.1 ' );
    console.log ( '-- Test for reserve words' );
    console.log ( '-- "hello" is a reserve Word?                ' + metaSettings.isReservedWord ( 'hello') );
    console.log ( '-- "metaCommandIndicator" is a reserve Word? ' + metaSettings.isReservedWord ( 'metaCommandIndicator') );
    console.log ( '-- "metaEchoInput" is a reserve Word?        ' + metaSettings.isReservedWord ( 'metaEchoInput') );
    console.log ( '--==== STEP : 1.1 ' );
    console.log ( '-- modify a reserve "metaIndicator" to "@"' );
    metaSettings.set ( 'metaIndicator', '@' );
    console.log ( metaSettings.getMetaSettings() );
    metaSettings.set ( 'metaIndicator', '_' );
    console.log ( metaSettings.getMetaSettings() );
    console.log ( '--==== STEP : 1.2 ' );
    console.log ( '-- test set/get new variable: color => green' );
    metaSettings.set ( 'color' , 'green' );
    metaSettings.set ( 'kind' , 'rose' );
    console.log ( '-- get "color" should been "green" ' + metaSettings.get ( 'color' ) );
    console.log ( metaSettings.getMetaSettings() );
    console.log ( '--==== STEP : 1.3 ' );
    console.log ( '-- Try to Delete reserve word' );
    console.log ( '-- Delete "metaCommandIndicator" reserve Word? ' + metaSettings.delete ( 'metaCommandIndicator') );
    console.log ( '-- delete "color" as variable ' + metaSettings.delete ( 'color' ) );
    console.log ( metaSettings.getMetaSettings() );
    console.log ( '--==== STEP : 1.4 ' );
    console.log ( '-- Test if the variable "kind" exists  ' + metaSettings.has ('kind' ) );
    console.log ( '-- Test if the variable "color" exists ' + metaSettings.has ('color' ) );
    console.log ( '--==== STEP : 1.5 ' );
    console.log ( '-- Number of variables defined is ' + metaSettings.numberOfEntries() );
    console.log ( '-- Delete "kind" reserve Word? ' + metaSettings.delete ( 'kind') );
    console.log ( '-- Number of variables defined is ' + metaSettings.numberOfEntries() );
    console.log ( '--==== STEP : 1.6 ' );
    console.log ( '-- test toJSON\n' + metaSettings.toJSON() );
    console.log ( "--==== STEP : 5.0 " );
    console.log ( "-- Restore to the first set of metaSettings");
    console.log ( "--==== STEP : 5.1 " );
    console.log ( metaSettings.getMetaSettings() );
    metaSettings.setNewMetaIndicator ( '@' );
    // metaSettings.restoreFromMap ( firstMetaSettings );
    console.log ( metaSettings.getMetaSettings() );
    console.log ( "--==== STEP : 5.2 " );
    metaSettings.setNewMetaIndicator ( '_' );
    console.log ( metaSettings.getMetaSettings() );
    return;

  } // End Function unitTestMetaSettings

    
/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestMetaSettings();
} // End if
// unitTestMetaSettings();