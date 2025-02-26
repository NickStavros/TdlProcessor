/**
 * File: LoopStack.js
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
 * @class LoopStack
 * @description is a stack of loop blocks allowing the nesting of loops. . Whenever a new
 * loop is identified in the template, a new LopBlock
 * is added to the stack. When the looping is completed, the 
 * LoopBlock is popped from the stack.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from './TemplateGlobalContext.js';
import TemplateStatement     from './TemplateStatement.js';
import MacroBlock            from './MacroBlock.js';

//===== Class Definition =====
export default class MacroStack
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #stack;

  //===== Constructors 
  constructor ( templateGlobalContext )
  { if ( !templateGlobalContext )
    { console.log ( '--*** No TemplateGlobalContext provided to Macros, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    this.#templateGlobalContext = templateGlobalContext;
    this.#templateGlobalContext.consoleTrace ( 'Starting Macros Constructor' );
    this.#templateGlobalContext = templateGlobalContext;
    this.#stack = new Map();
    this.#templateGlobalContext.consoleTrace (  'Finishing Macros Constructor' );
  } // End constructor

  getNumberOfMacros()
  { return this.#stack.size;
  } // End function getNumberOfMacros

  has ( key )
  { return this.#stack.has ( key );
  } // End function has

  getMacroDefinition ( key )
  { return this.#stack.get ( key );
  } // End function getMacroDefinition

  //===== Setters
  delete ( key )
  { if  ( this.has ( key ) )
    { this.#stack.delete ( key );
    } // End if
  } // End function has

  addMacroDefinition ( newMacroDefinition )
  { this.#stack.set ( newMacroDefinition.getNameOfMacro(), newMacroDefinition );
    return this.#stack.size;
  } // End function addMacroDefinition

  has ( key )
  { let localResult = this.#stack.has ( key );
    return localResult;
  } // End function has

  get ( key )
  { let localResult = this.#stack.get ( key );
    return localResult;
  } // End function has

  createMacroDefinition ( templateStatement, lineCount, linesOfFile  )
  { let metaIndicator      = this.#templateGlobalContext.getMetaIndicator()
    let macroEndCharacters = metaIndicator 
                             + this.#templateGlobalContext.getMetaCommandList ().get ( 'MACRO_END' );
    let macroBlock;
    let lineOfCode;
    let templateCommand;
    let nameOfMacro = templateStatement.getObject();
    let parameters = templateStatement.getExpression().trim();
    let listOfParameters = [];
    if ( parameters[0] === '(' )
    { parameters = parameters.substring ( 1 ).trim();
      if ( parameters [ parameters.length-1 ] !== ')' )
      { console.log ( '--*** Parentheses are mis matched, parentheses ignored.' );
      } // End if
      else
      { parameters = parameters.substring ( 0,  ( parameters.length - 1 ));
      } // End else
      listOfParameters = parameters.split (',' );
    } // End if
    macroBlock = new MacroBlock (  nameOfMacro, listOfParameters, this.#templateGlobalContext  );
    //lineCount++;
    while ( lineCount < linesOfFile.length  )
    { lineOfCode = linesOfFile [ lineCount ];
      templateStatement = new TemplateStatement ( lineOfCode, this.#templateGlobalContext );
      templateCommand = metaIndicator + templateStatement.getKindOfText()[0];
      if ( lineOfCode.trim() === macroEndCharacters )
      { break;
      } // End if
      macroBlock.addLineOfCode ( lineOfCode );
      lineOfCode = linesOfFile [ lineCount ];
      lineCount++;
    } // End while
    return [ lineCount, macroBlock ];
  }  // End function createMacroDefinition

  toJSON()
  { this.#templateGlobalContext.consoleTrace ( 'Starting MacroBlock:toJSON');
    let jsonText = '{\n';
    let indexCounter = 0;
    let itemTerminator = ',';
    let sizeOfStack = this.#stack.size;
    this.#stack.forEach
      ( (value, key ) =>
         { // console.lo g( value.toJSON(), key );
          // jsonText += '  "' + key + '"      , ' + value.toJSON();
          indexCounter++;
          jsonText += '{ "' + value.getNameOfMacro() + '",';
          jsonText +=  value.toJSON();
          jsonText += '}' + itemTerminator + '\n';
          if ( indexCounter = sizeOfStack )
          { itemTerminator = '';
          } // End if
         }
      );
      jsonText += '\n}';
     this.#templateGlobalContext.consoleTrace ( 'Finishing MacroBlock:toJSON -> \n' + jsonText );
    return jsonText
  } // End function toJSON

} // End class Macros

function unitTestMacros()
{ let templateGlobalContext = new TemplateGlobalContext();
  let macroStack = new MacroStack ( templateGlobalContext );
  let macroBlock;
  let templateStatement;
  let lineOfCode = '';
  let createResult;
  let linesOfFile
    = [ 'there is nothing to say',
        '_{ makeIntoNames ( name, job )',
        'This is a the _&name.',
        'Another line of text _&job.',
        '_#set happy glad',
        'This is _&happy.',
        '',
        '_}',
        '',
        'still more nothing to say',
        '_{ anotherMacro ( firstArg, secondArg, thirdArg )',
        '/*    this is the standard header for the project',
        '      It was developed by &companyName. on &date.',
        '      ALL RIGHTS RESERVED',
        '*/',
        '_}',
        'And this is the finale'
     ];
for (let lineCount = 0; 
         lineCount < linesOfFile.length; 
         lineCount++
    )
{ lineOfCode = linesOfFile [ lineCount ];
  templateStatement = new TemplateStatement ( lineOfCode, templateGlobalContext );
  let templateCommand = templateStatement.getKindOfText()[0];
  console.log ( '-- templateStatement -> ' + templateStatement.toJSON() );
  if ( templateCommand === 'MACRO_BEGIN' )
  { createResult = macroStack.createMacroDefinition ( templateStatement, lineCount, linesOfFile,  );
    lineCount    = createResult[0];
    macroBlock   = createResult[1];
    macroStack.addMacroDefinition ( macroBlock );
  } // End if
  else
  { console.log ( '@@@@ Skipping : -> ' + lineOfCode );
  } // End else
} // End for loop
console.log ( '%%%%% Macros ->\n' + macroStack.toJSON() );
} // End function unitTestMacros

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestMacros();
} // End if