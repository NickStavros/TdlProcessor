/**
 * File: CursorDefinitions.js
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
 * @class CursorDefinitions
 * @description stores the definitions for the CursorStatements found in
 * the template.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext          from './TemplateGlobalContext.js';
import CursorStatement                from './CursorStatement.js';

//===== Class Definition =====
export default class CursorDefinitions
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #cursorMap;

//===== Constructors 
constructor ( templateGlobalContext )
{ if ( !templateGlobalContext )
  { console.log ( '--*** No TemplateGlobalContext provided to CursorDefinitions, creating new local copy.' );
    templateGlobalContext = new TemplateGlobalContext();
  } // End if
  this.#templateGlobalContext =  templateGlobalContext;
  templateGlobalContext.consoleTrace ( 'Starting CursorDefinitions Constructor' );
  this.#cursorMap = new Map();
  templateGlobalContext.consoleTrace ( 'Finishing CursorDefinitions Constructor' );
} // End constructor

getCursorMap()
{ this.#templateGlobalContext.consoleTrace ( 'Executing CursorDefinitions.getCursorMap' );
  return this.#cursorMap;
} // End function getCursorMap

clear()
{ this.#templateGlobalContext.consoleTrace ( 'Executing CursorDefinitions.clear' );
  return this.#cursorMap.clear();
} // End function clear

delete ( key )
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorDefinitions.delete -> ' + key );
  let localResult = this.#cursorMap.delete ( key );
  this.#templateGlobalContext.consoleTrace ( 'Finishing CursorDefinitions.delete -> ' + localResult );
  return localResult;
} // End function delete

entries ()
{ this.#templateGlobalContext.consoleTrace ( 'Executing CursorDefinitions.entries' );
  return this.#cursorMap.entries ();
} // End function delete

get ( key )
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorDefinitions.get -> ' + key );
  let localResult = this.#cursorMap.get ( trim(key) );
  this.#templateGlobalContext.consoleTrace ( 'Finishing CursorDefinitions.get -> ' + localResult );
  return localResult;
} // End function get

has ( key )
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorDefinitions.has -> ' + key );
  let localResult = this.#cursorMap.has ( key );
  this.#templateGlobalContext.consoleTrace ( 'Finishing CursorDefinitions.has -> ' + localResult );
  return localResult;
} // End function has

keys ()
{ this.#templateGlobalContext.consoleTrace ( 'Executing CursorDefinitions.keys' );
  return this.#cursorMap.keys ();
} // End function has

set ( cursorStatementText) 
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorDefinitions.set -> ' + cursorStatementText );
  let cursorStatement = new CursorStatement ( this.#templateGlobalContext ); 
  cursorStatement.parseCursorStatement ( cursorStatementText );
  this.#cursorMap.set ( cursorStatement.getNameOfCursor (), cursorStatement );
  let temp = this.#cursorMap.get ( cursorStatement.getNameOfCursor () );
  this.#templateGlobalContext.consoleTrace ( 'finishing CursorDefinitions.set -> ' + this.#cursorMap.size );
} // End function set 

values ()
{ this.#templateGlobalContext.consoleTrace ( 'Executing CursorDefinitions.values' );
  return this.#cursorMap.values ();
} // End function has

toJSON()
{ this.#templateGlobalContext.consoleTrace ( 'Starting Cursor.toJSON ' );
  let jsonText =  "\n{\n";
  for ( let cursorDefinition of this.#cursorMap.entries() )
  { jsonText += '"' + cursorDefinition[0] + '",\n'
                + cursorDefinition[1].toJSON();
  } // End for
  jsonText += "}\n";
this.#templateGlobalContext.consoleTrace ( 'Finishing Cursor.toJSON'  );
return jsonText;
} // End function toJSON

} // End class CursorDefinitions

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ console.log ( "--*** No Unit Test Available " );
  //unitTestCursorDefinition();
} // End if