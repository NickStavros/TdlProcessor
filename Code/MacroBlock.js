/**
 * File: MacroBlock.js
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
 * @class MacroBlock
 * @description describes the definition of macros within the template.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from './TemplateGlobalContext.js';
import TemplateStatement     from './TemplateStatement.js';
import { toValidNameChars }  from './TdlUtils.js';

//===== Class Definition =====
export default class MacroBlock
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #nameOfMacro;
    #listOfParameters;
    #macroContents = [];
    #lineNumber;

  //===== Constructors 
    constructor ( nameOfMacro, listOfParameters, templateGlobalContext  )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to MacroBlock, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      this.#templateGlobalContext = templateGlobalContext;
      this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock Constructor' );
      this.#templateGlobalContext = templateGlobalContext;
      this.#setNameOfMacro      ( nameOfMacro );
      this.#setListOfParameters ( listOfParameters );
      this.#lineNumber            = -1;
      this.#macroContents         = [];
      this.#templateGlobalContext.consoleTrace (  'Finishing MacroBlock Constructor' );
    } // End constructor

  //===== Getters
    getNameOfMacro()
    { return this.#nameOfMacro;
    } // End function getNameOfMacro

    gefListOfParameters()
    { return this.#listOfParameters;
    } // End function gefListOfParameters

    getLineNumber()
   { this.#templateGlobalContext.consoleTrace ( 'Executing MacroBlock:getLineNumber -> ' + this.#lineNumber );
     return this.#lineNumber;
   } // End function getLineNumber

   getCurrentLine()
   { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:getCurrentLine -> ' + this.#lineNumber );
     this.#lineNumber = Math.max ( this.#lineNumber, 0) ;
     this.#lineNumber = Math.min ( this.#lineNumber, this.#macroContents.length ) ;
     let lineOfText = this.#macroContents [ this.#lineNumber ];
     this.#templateGlobalContext.consoleTrace ( 'Finishing MacroBlock:getCurrentLine -> ' + lineOfText );
     return lineOfText;
   } // End function getCurrentLine

   getMacroContents()
   { this.#templateGlobalContext.consoleTrace ( 'Executing MacroBlock:getMacroContents '  );
     return this.#macroContents;
   } // End function getMacroContents

   gotoTop()
   { this.#templateGlobalContext.consoleTrace ( 'Executing MacroBlock:gotoTop' );
     this.#lineNumber = -1;
   } // End function gotoTop

   gotoBottom()
   { this.#templateGlobalContext.consoleTrace ( 'Executing MacroBlock:gotoBottom' );
     this.#lineNumber = this.#macroContents.length - 1;
   } // End function gotoBottom

   isEmpty ( )
   { this.#templateGlobalContext.consoleTrace ( 'Executing MacroBlock:isEmpty -> ' + (this.#macroContents.length === 0) );
     return this.#macroContents.length === 0;
   } // End function isEmpty

   isEof ( )
   { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:isEof');
     let localResult = true;
     if ( typeof this.#lineNumber !== 'undefined' && typeof this.#macroContents != 'undefined' )
     { localResult = this.#lineNumber >= this.#macroContents.length;
     } // End if
     if ( localResult )
     { console.log ( '--+++ Macro Block Eof encountered' );
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing MacroBlock:isEof -> ' + localResult);
     return  localResult;
   } // End function isEmpty

   nextLine()
   { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:nextLine' );
     let text;
     if ( this.#macroContents.length >= this.#lineNumber )
     { this.#lineNumber++;
       text = this.#macroContents[this.#lineNumber];
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing MacroBlock:nextLine -> ' + text);
     return text;
   } // End function nextLine

   previousLine()
   { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:previousLine' );
     let text;
     if ( this.#lineNumber > -1 )
     { text = this.#macroContents[this.#lineNumber];
       this.#lineNumber--;
     } // End if
     this.#templateGlobalContext.consoleTrace ( 'Finishing MacroBlock:previousLine -> ' + text);
     return text;
   } // End function previousLine

  //==== Setters
    #setNameOfMacro ( nameOfMacro )
    { if ( !nameOfMacro )
      { console.log ( '--*** The name of the macro can not be null');
      } // End if
      else 
      { nameOfMacro = toValidNameChars ( nameOfMacro );
        if ( nameOfMacro.trim().length === 0  )
        { console.log ( '--*** The name of the macro can not be empty');
        } // End if 
      } // End else
      this.#nameOfMacro = nameOfMacro;
    } // End function setNameOfMacro

    #setListOfParameters ( listOfParameters )
    { this.#listOfParameters = [];
      if ( typeof listOfParameters === 'string' 
           || typeof listOfParameters === 'number'
           || typeof listOfParameters === 'boolean'
         )
      { this.#listOfParameters[0] = listOfParameters;
      } // End if 
      else 
      { this.#listOfParameters = listOfParameters;
      } // End else
    } // End function setListOfParameters

    setMacroContents ( macroContents )
    { if ( ! macroContents )
      {  console.log ( '--*** can not define an Empty Macro: -> ' +  this.getNameOfMacro() );
      } // End If
      this.#macroContents = macroContents;
    } // End function setLinesOfMacro

    addLineOfCode ( lineOfCode )
    { this.#macroContents.push ( lineOfCode );
    } // End function addLineOfCode

    setLineNumber ( newLineNumber )
    { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:setLineNumber -> ' + newLineNumber );
      if ( !newLineNumber || newLineNumber < 0 )
      { newLineNumber = 0;
      } // End if
      if ( newLineNumber > this.#macroContents.length )
      { newLineNumber = this.#macroContents.length;
      } // End if
      this.#lineNumber = newLineNumber
      let lineOfText = this.getCurrentLine();
      this.#templateGlobalContext.consoleTrace ( 'Ending MacroBlock:setLineNumber -> "' + lineOfText + '"' );
      return lineOfText;
    } // End function setLineNumber

    toJSON()
    { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:toJSON');
      let jsonText
        =  "\n{\n"
           + "  \"nameOfMacro\"             : \"" + this.#nameOfMacro + "\",\n"
           + "  \"listOfParameters\"        : \"" + this.#listOfParameters + "\",\n"
           + "  \"lineNumber\"              : \"" + this.#lineNumber + "\"\n"
           + "  \"macroContents\"           : \n" + JSON.stringify ( this.#macroContents, null, "\t" ) + ",\n"
           +"}\n";
       this.#templateGlobalContext.consoleTrace ( 'Finishing MacroBlock:toJSON -> \n' + jsonText );
      return jsonText
    } // End function toJSON

  
} // End class MacroBlock

function unitTestMacroBlock()
{ let templateGlobalContext = new TemplateGlobalContext();
  let macroEndCharacters = templateGlobalContext.getMetaCommandList ().get ( 'MACRO_END' );
  let macroBlock;
  let templateStatement;
  let lineOfCode = '';
  let linesOfFile
    = [ '_{ makeIntoNames ( name, job )',
        'This is a the _&name.',
        'Another line of text _&job.',
        '_#set happy glad',
        'This is _&happy.',
        '_}'
     ];
  console.log ( 'linesOfFile -> \n' + linesOfFile.join('\n') );
  templateGlobalContext.setTraceState ( false );
  for (let lineCount = 0; 
           lineCount < linesOfFile.length; 
           lineCount++
       )
  { lineOfCode = linesOfFile [ lineCount ];
    templateStatement        = new TemplateStatement ( lineOfCode, templateGlobalContext );
    console.log ( '-- templateStatement ->\n' + templateStatement.toJSON() );
    let templateCommand = templateStatement.getKindOfText()[0];
    if ( templateCommand === 'MACRO_BEGIN' )
    { let nameOfMacro = templateStatement.getObject();
      let parameters = templateStatement.getExpression().trim();
      let listOfParameters = [];
      if ( parameters[0] === '(' )
      { parameters = parameters.substring ( 1 ).trim();
        if ( parameters [ parameters.length-1 ] !== ')' )
        { console.log ( '--*** Parentheses are mis matched, parentheses ignored.' );
        } // End if
        else
        { parameters = parameters.substring ( 0,  ( parameters.length - 1 ));
        }
        listOfParameters = parameters.split (',' );
     } /// End if
     else
     { console.log ( '--+++ Skipping : -> ' + lineOfCode );
     } // End else
     macroBlock = new MacroBlock (  nameOfMacro, listOfParameters, templateGlobalContext  );
     lineCount++;
     while ( lineCount < linesOfFile.length )
     { lineOfCode = linesOfFile [ lineCount ];
       templateStatement = new TemplateStatement ( lineOfCode, templateGlobalContext );
       if ( lineOfCode.trim() === macroEndCharacters )
       { break;
       } // End if
       macroBlock.addLineOfCode ( lineOfCode );
       lineOfCode = linesOfFile [ lineCount ];
       lineCount++;
     } // End while
    } // End if
  } // End for lineCount
  templateGlobalContext.setTraceState ( false );
  console.log ( '@@@@ macroBlock->\n' + macroBlock.toJSON() );
} // End function unitTestMacroBlock

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestMacroBlock();
} // End if
