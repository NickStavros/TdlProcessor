/**
 * File: ConditionalCodeStack.js
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
 * @class ConditionalCodeStack
 * @description Conditional statements are stored as a stack. As new 
 * conditional blocks are encountered, it is added to the stack, when 
 * they are finished being processed, the statements are popped from
 * the stack.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from './TemplateGlobalContext.js';
import ConditionalCodeBlock  from './ConditionalCodeBlock.js';
import TemplateStatement     from './TemplateStatement.js';

//===== Class Definition =====
export default class ConditionalCodeStack
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #stack;
    #stackDepth;
    #stackArray;
    
  //===== Constructors 
    constructor ( templateGlobalContext )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to ConditionalCodeStack, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      templateGlobalContext.consoleTrace ( 'Starting ConditionalCodeStack Constructor' );
      this.#templateGlobalContext = templateGlobalContext;
      this.reset ( );
      templateGlobalContext.consoleTrace ( 'Finishing ConditionalCodeStack Constructor' );
    } // End constructor

    reset ()
    { this.#stack        = new Array();
      this.#stack[0]     = new ConditionalCodeBlock ( this.#templateGlobalContext );
      this.#stack[0].setLogicExpression     ();
      this.#stack[0].resetStatementCounter  ();
      this.#stackDepth   = this.#stack.length;
      this.#stackArray   = Array.from ( this.#stack[0] );
    } // End function reset

  //===== Getters
    
    getConditionalStatement()
    { this.#templateGlobalContext.consoleTrace ( 'Starting getConditionalStatement' );
      let conditionalStatement = undefined;
      if ( typeof this.#stack  !== "undefined" )
      { conditionalStatement = this.getCurrentBlock().getConditionalStatement();
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing getConditionalStatement -> \n' + conditionalStatement );
      return conditionalStatement;
    } // End function getConditionalStatement

    getHasBeenProcessed()
    { this.#templateGlobalContext.consoleTrace ( 'Starting getStackDepth -> ' );
      let localResult = this.getCurrentBlock().getHasBeenProcessed();
      this.#templateGlobalContext.consoleTrace ( 'Starting getStackDepth -> ' + localResult );
      return localResult;
    } // End function getHasBeenProcessed
    
    getLogicExpression()
    { this.#templateGlobalContext.consoleTrace ( 'Starting getLogicExpression' );
      let logicExpression = undefined;
      if ( typeof this.#stack  !== "undefined" )
      { logicExpression = this.getCurrentBlock().getLogicExpression();
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing getLogicExpression ->\n' +  logicExpression );
      return logicExpression;
    } // End function getLogicExpression
    
    getLogicResult()
    { this.#templateGlobalContext.consoleTrace ( 'Starting getLogicResult' );
      let logicResult = undefined;
      if ( typeof this.#stack  !== "undefined" )
      { logicResult = this.getCurrentBlock().getLogicResult();
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing getLogicResult -> ' + logicResult );
      return logicResult;
    } // End function getLogicResult

    getStackDepth()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getStackDepth -> ' + this.#stackDepth );
      return this.#stackDepth;
    } // End function getStackDepth 
    
    getStatementsProcessedCount()
    { this.#templateGlobalContext.consoleTrace ( 'Starting getStatementsProcessedCount' );
      let statementCount = undefined;
      if ( typeof this.#stack  !== "undefined" )
      { statementCount = this.getCurrentBlock().getStatementsProcessedCount();
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Starting getStatementsProcessedCount -> ' + statementCount);
      return statementCount;
    } // End function getStatementsProcessedCount

    getCurrentBlock()
    { this.#templateGlobalContext.consoleTrace ( 'Starting getCurrentBlock' );
      let localResult = this.#stack [ this.#stack.length -1 ];
      this.#templateGlobalContext.consoleTrace ( 'Finishing getCurrentBlock -> ' + localResult );
      return localResult;
    } // End function getCurrentBlock

    isProcessable()
    { // this.#templateGlobalContext.setTraceState ( true );
      this.#templateGlobalContext.consoleTrace ( 'Starting isProcessable' );
      let localResult = true;
      if ( typeof this.#stack !== 'undefined' && this.#stack?.length > 0 )
      { localResult = this.getCurrentBlock().isProcessable();
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing isProcessable -> ' + localResult );
      // this.#templateGlobalContext.setTraceState ( false );
      return localResult;
    } // End function isProcessable

    getTemplateGlobalContext()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getTemplateGlobalContext' );
      return this.getCurrentBlock().getTemplateGlobalContext();
    } // End function getTemplateGlobalContext

    incrementStatementCounter()
    { this.#templateGlobalContext.consoleTrace ( 'Executing incrementStatementCounter' );
      this.getCurrentBlock().incrementStatementCounter();
    } // End function incrementStatementCounter

    setLogicExpression ( logicExpression )
    { this.#templateGlobalContext.consoleTrace ( 'Starting getLogicExpression -> ' + logicExpression );
      //console.log ( '--##### setLogicExpression.logicExpression : ' + logicExpression );
      //console.log (  '--##### typeof this.#stack : ' + typeof this.#stack );
      if ( this.#stack )
      { this.getCurrentBlock().setLogicExpression ( logicExpression );
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing getLogicExpression -> ' +  logicExpression );
    } // End function getLogicExpression

    popConditionalCodeBlock()
    { this.#templateGlobalContext.consoleTrace ( 'Starting popConditionalCodeBlock' );
      //console.log ( '&&&&&& this.#stack.length : ' + this.#stack.length );
      this.#stack.pop();
      this.#stackDepth--;
      if ( this.#stack.length !== this.#stackDepth )
      { this.#templateGlobalContext.consoleTrace ( '--*** Integrity Error'); 
        this.#stackDepth = this.#stack.length;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing popConditionalCodeBlock -> ' +  this.#stackDepth );
      return this.#stackDepth;
    } // End function ConditionalCodeBlock

    pushConditionalCodeBlock ( conditionalCodeBlock )
    { this.#templateGlobalContext.consoleTrace ( 'Starting pushConditionalCodeBlock ->\n' + conditionalCodeBlock.toJSON() );
      // let templateStatement     = new TemplateStatement ( lineOfCode, lineOfCode );
      //let conditionalCodeBlock  = new ConditionalCodeBlock ( this.#templateGlobalContext );
      //console.log ( '-- Parse the lineOfCode -> \n' + conditionalCodeBlock.toJSON() );
      //let codeProcessed = conditionalCodeBlock.processConditionalStatement ( lineOfCode );
      //console.log ( '-- codeProcessed            : ' + codeProcessed );
      //console.log ( '##### 450 stackDepth : ' + this.getStackDepth() + ' : ' + this.#stack.length);
      this.#stack.push ( conditionalCodeBlock );
      //console.log ( '##### 470 stackDepth : ' + this.getStackDepth() );
      this.#stackDepth = this.#stack.length;
      //console.log ( '##### 480 stackDepth : ' + this.getStackDepth() );
      this.#stackArray = Array.from ( this.#stack );
      //console.log ( '##### 490 stackDepth : ' + this.getStackDepth() );
      this.#templateGlobalContext.consoleTrace ( 'Finishing pushConditionalCodeBlock -> ' + this.#stackDepth );
    } // End function pushConditionalCodeBlock

    findConditionalBlock ( linesOfTemplateCode, lineCount, endOfConditionalBlock )
    { let lineOfCode;
      let templateStatement;
      let operationKind;
      do 
      { lineCount++;
        lineOfCode = linesOfTemplateCode[lineCount];
        if ( ! lineOfCode )
        { console.log ( '--*** Warning unbalance IF/ENDIF block' ); 
          break
        } // End if
        console.log ( '=== Skipping -> "' + lineOfCode + '"' );
        templateStatement = new TemplateStatement ( lineOfCode, this.#templateGlobalContext );
        operationKind = templateStatement.getKindOfText()[0];
      } while ( lineCount < linesOfTemplateCode.length && operationKind !== endOfConditionalBlock );
      return lineCount;
    } // End function findConditionalBlock

    processConditionalStatements ( linesOfTemplateCode, lineCount, templateStatement, operationKind )
    { // Encountered a Conditional Logic Statement IF, ELSEIF, ELSE or ENDIF
      // Create a ConditionalCodeBlock
      this.#templateGlobalContext.consoleTrace ( 'Starting ConditionalCodeStack.processConditionalStatements -> ' + operationKind  );
      let conditionalCodeBlock  = new ConditionalCodeBlock ( this.#templateGlobalContext );
      let conditionalCodeStack = this;
      let executeStatements;
      conditionalCodeBlock.setConditionalStatement ( templateStatement );
      // conditionalCodeBlock.setLogicExpression ( templateStatement.getArgumentText() );
      if ( operationKind === 'IF' )
      { // Encountered a new IF Statement, push it onto the ConditionalCodeStack.
        conditionalCodeBlock.setLogicExpression ( templateStatement.getArgumentText() );
        if ( ! conditionalCodeStack.getCurrentBlock().getLogicResult() ) 
        { lineCount = conditionalCodeStack.findConditionalBlock ( linesOfTemplateCode, lineCount, 'ENDIF' );
          this.popConditionalCodeBlock();
        } // End if
        conditionalCodeStack.pushConditionalCodeBlock ( conditionalCodeBlock );
      } // End if IF
      else if ( operationKind === 'IF_DEF')
      { let booleanResult = this.#templateGlobalContext.getLocalVariableStack().has ( templateStatement.getObject() );
        conditionalCodeBlock.setLogicExpression ( booleanResult );
        conditionalCodeStack.pushConditionalCodeBlock ( conditionalCodeBlock );
      } // End else if 
      else if ( operationKind === 'IF_NOT_DEF')
      { let booleanResult = ! this.#templateGlobalContext.getLocalVariableStack().has ( templateStatement.getObject() );
        conditionalCodeBlock.setLogicExpression ( booleanResult );
        conditionalCodeStack.pushConditionalCodeBlock ( conditionalCodeBlock );
      } // End else if 
      else if ( operationKind === 'IF_SET')
      { let booleanResult = this.#templateGlobalContext.isGloballySet ( templateStatement.getObject() );
        conditionalCodeBlock.setLogicExpression ( booleanResult );
        conditionalCodeStack.pushConditionalCodeBlock ( conditionalCodeBlock );
      } // End else if 
      else if ( operationKind === 'IF_NOT_SET')
      { let booleanResult = ! this.#templateGlobalContext.isGloballySet ( templateStatement.getObject() );
        conditionalCodeBlock.setLogicExpression ( booleanResult );
        conditionalCodeStack.pushConditionalCodeBlock ( conditionalCodeBlock );
      } // End else if 
      else if (  operationKind === 'ELSE_IF' 
                 || operationKind === 'ELSEIF' 
                 || operationKind === 'ELSIF' 
              )
      { conditionalCodeBlock.setLogicExpression ( templateStatement.getArgumentText() );
        conditionalCodeStack.setLogicExpression ( templateStatement.getArgumentText() );
        if ( conditionalCodeStack.getHasBeenProcessed() )
        { conditionalCodeStack.setLogicExpression ( '1===0' );
        } // End if
        else
        { conditionalCodeStack.setLogicExpression ( templateStatement.getArgumentText() );
        } // End else
      } // End else if ELSEIF
      else if ( operationKind === 'ELSE' )
      { conditionalCodeBlock.setLogicExpression ( templateStatement.getArgumentText() );
        if ( conditionalCodeStack.getHasBeenProcessed() )
        { conditionalCodeStack.setLogicExpression ( '1===0' );
        } // End if
        else
        { conditionalCodeStack.setLogicExpression ( '1===1' );
        }
      } // End else ELSE
      else if ( operationKind === 'ENDIF' )
      { //Made it to the end of the Conditional Logic Block, pop it from the conditionalCodeStack
        let depth = conditionalCodeStack.popConditionalCodeBlock();
        if ( depth == 0 )
        { let errorMessage = '--*** IF/ENDIF imbalance, check template file';
          console.log ( errorMessage );
          throw errorMessage;
        } // End if
        else if ( conditionalCodeStack.getCurrentBlock() )
        { executeStatements = conditionalCodeStack.getCurrentBlock().getLogicResult();
        } // End if
      } // End else if
      this.#templateGlobalContext.consoleTrace ( 'Finishing ConditionalCodeStack.processConditionalStatements -> ' + lineCount  );
      return lineCount;
    } // End function processConditionalStatements
  
    toJSON()
    { this.#templateGlobalContext.consoleTrace ( 'Starting toJSON '  );
      let jsonString = "";
      jsonString
             = '{\n'
             + '"stackDepth"                ,  "' + this.#stackDepth               + '",' + '\n'  
             + '"stack"                     ,  \n';
      this.#stackArray.forEach
             ( ( element, index ) => 
                 { jsonString += index + ': ' + element.toJSON(); 
                 }
             );
      jsonString = jsonString + '}\n';
      this.#templateGlobalContext.consoleTrace ( 'Finishing toJSON ->\n'  + jsonString );
      return jsonString;
    } // end function toJSON

} // End class ConditionalCodeStack

function unitTestConditionalCodeStack()
{ console.log ( '\n\n========== Unit Test for ConditionalCodeStack ==========' );
  let conditionalCodeStack;
  let conditionalCodeBlock;
  let templateGlobalContext = new TemplateGlobalContext();
  let lineOfCode = '';

  /* console.log ( '\n\n===== Step 1.0' );
  templateGlobalContext.setTraceState ( false );
  
  let lineOfCode = '_#IF    1+3 < 5    ';
  let conditionalCodeBlock  = new ConditionalCodeBlock ( templateGlobalContext );
  let codeProcessed = conditionalCodeBlock.processConditionalStatement ( lineOfCode );
  
  console.log ( '-- set up first statement   : "' + lineOfCode + '"' );
  console.log ( '-- codeProcessed            : ' + codeProcessed );
  console.log ( conditionalCodeBlock.toJSON() );
  
  console.log ( '\n\===== Step 1.5' );
  templateGlobalContext.setTraceState ( false );
  console.log ( '-- Creating a stack of code blocks' );
  conditionalCodeStack = new ConditionalCodeStack ( lineOfCode, templateGlobalContext );

  console.log ( '\n\n===== Step 2.0' );
  console.log ( '-- Test the stack when queried gives the result of lineOfCode in Step 1.0' );
  console.log ( '-- conditionalCodeStack ->\n ' + conditionalCodeStack.toJSON() );
  console.log ( '-- isProcessable            : ' + conditionalCodeStack.isProcessable() );
  console.log ( '-- ConditionalStatement     : ' + conditionalCodeStack.getConditionalStatement() );
  console.log ( '-- LogicExpression          : ' + conditionalCodeStack.getLogicExpression() );
  console.log ( '-- LogicResult              : ' + conditionalCodeStack.getLogicResult() );
  console.log ( '-- StatementsProcessedCount : ' + conditionalCodeStack.getStatementsProcessedCount() );


  console.log ( '\n\n===== Step 3.0' );
  console.log ( '-- Create a new lineOfCode' ); 
  lineOfCode = '_#IF 1 === 1 ';
  console.log ( '-- lineOfCode : "' + lineOfCode + '"' );
  conditionalCodeStack.reset ( lineOfCode );
  conditionalCodeStack.pushConditionalCodeBlock ( lineOfCode );
  console.log ( '-- Conditional Code Stack  ->\n ' + conditionalCodeStack.toJSON() );
  console.log ( '-- Stack Depth ' + conditionalCodeStack.getStackDepth() );

  console.log ( '\n===== Step 3.1 ' );
  console.log ( '-- POP conditionalCodeStack' ); 
  let stackDepth = conditionalCodeStack.popConditionalCodeBlock();
  console.log ( '####### stackDepth : ' + stackDepth );
  console.log ( '-- Stack Depth ' + conditionalCodeStack.getStackDepth() );
  */

  console.log ( '\n\n===== Step 4.0' );
  if ( ! conditionalCodeStack )
  { conditionalCodeStack = new ConditionalCodeStack ( );
  } // ENd if 
  else
  { conditionalCodeStack.reset ();
  } // End else
  console.log ( '##### 000 stackDepth : ' + conditionalCodeStack.getStackDepth() );
  let linesOfTemplateCode
    = [ 'this is the beginning of text.',
        '_#IF 1===0',
        '  This is the line 1.',
        '  _#IF 1===0',
        '    This is the line 2 ORIGINAL.',
        '  _#ELSE',
        '    This is the line 2 UPDATED.',
         '  _#ENDIF',
        '_#ELSIF 1===0',
        '  This is the line 3.',
        '  This is the line 4.',
        '_#ELSIF 1===0',
        '  This is the line 5.',
        '  This is the line 6.',
        '_#ELSE',
        '  This is the line 7.',
        '  This is the line 8.',
        '_#ENDIF',
        'this is the ending of text.'
     ];
  console.log ( 'linesOfTemplateCode -> \n' + linesOfTemplateCode.join('\n') );
  templateGlobalContext.setTraceState ( false );
  for (let lineCount = 0; 
           lineCount < linesOfTemplateCode.length; 
           lineCount++
       )
  { lineOfCode = linesOfTemplateCode[lineCount];
    let executeStatements = conditionalCodeStack.getCurrentBlock().getLogicResult();
    console.log ( '--> ' + lineCount + ') lineOfCode:' + lineOfCode  );
    let templateStatement = new TemplateStatement ( lineOfCode, templateGlobalContext );
    let operationKind = templateStatement.getKindOfText()[0];
    if ( templateStatement.isMetaCommand() 
         && ( operationKind === 'IF'
               || operationKind === 'IF_DEF'
               || operationKind === 'IF_N_DEF'
               || operationKind === 'IF_N_SET'
               || operationKind === 'IF_SET'
               || operationKind === 'ELSEIF' 
               || operationKind === 'ELSIF'
               || operationKind === 'ELSE'
               || operationKind === 'ENDIF'
         )
       )
    { lineCount 
        = conditionalCodeStack.processConditionalStatements
            ( linesOfTemplateCode, 
              lineCount, 
              templateStatement, 
              operationKind
            );
    } // End if
      /*
      // Encountered a Conditional Logic Statement IF, ELSEIF, ELSE or ENDIF
      // Create a ConditionalCodeBlock
      conditionalCodeBlock  = new ConditionalCodeBlock ( templateGlobalContext );
      conditionalCodeBlock.setConditionalStatement ( templateStatement );
      conditionalCodeBlock.setLogicExpression ( templateStatement.getArgumentText() );
      if ( operationKind === 'IF' )
      { // Encountered a new IF Statement, push it onto the ConditionalCodeStack.
        if ( ! conditionalCodeStack.getCurrentBlock().getLogicResult() ) 
        { lineCount = conditionalCodeStack.findConditionalBlock ( linesOfTemplateCode, lineCount, 'ENDIF' );
          conditionalCodeStack.popConditionalCodeBlock();
        } // End if
        conditionalCodeStack.pushConditionalCodeBlock ( conditionalCodeBlock );
      } // End if IF
      else if (  operationKind === 'ELSEIF' 
                 || operationKind === 'ELSIF' 
              )
      { conditionalCodeStack.setLogicExpression ( templateStatement.getArgumentText() );
        if ( conditionalCodeStack.getHasBeenProcessed() )
        { conditionalCodeStack.setLogicExpression ( '1===0' );
        } // End if
        else
        { conditionalCodeStack.setLogicExpression ( templateStatement.getArgumentText() );
        } // End else
      } // End else if ELSEIF
      else if ( operationKind === 'ELSE' )
      { if ( conditionalCodeStack.getHasBeenProcessed() )
        { conditionalCodeStack.setLogicExpression ( '1===0' );
        } // End if
        else
        { conditionalCodeStack.setLogicExpression ( '1===1' );
        }
      } // End else ELSE
      else if ( operationKind === 'ENDIF' )
      { //Made it to the end of the Conditional Logic Block, pop it from the conditionalCodeStack
        conditionalCodeStack.popConditionalCodeBlock();
        executeStatements = conditionalCodeStack.getCurrentBlock().getLogicResult();
      } // End else if
    } // End if MetaCommand
    */
    else
    { //  conditionalCodeStack.isProcessable() : ' + conditionalCodeStack.isProcessable());
      if ( conditionalCodeStack.isProcessable() )
      { conditionalCodeStack.incrementStatementCounter();
        console.log 
          ( '<-- ' //+ conditionalCodeStack.isProcessable() 
                   //+ ":" + executeStatements 
                   // + ' <-> '
                   + lineCount
                   + ') lineOfCode:' 
                   + lineOfCode  );
      } // End if
    } // End else
  } // End for

} // End function unitTestConditionalCodeStack

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ unitTestConditionalCodeStack();
} // End if