/**
 * File: ConditionalCodeBlock.js
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
 * @class ConditionalCodeBlock
 * @description The lines of code between the conditional statements
 * such as:
 *   * IF
 *   * IF_N_SET
 *   * IF_SET
 *   * IF_NOT_SET
 *   * IF_DEF
 *   * IF_NOT_DEF
 *   * ELSE_IF
 *   * ELSIF
 *   * ELSE
 * are considered the ConditionalCodeBlock. The class processes those
 * blocks of code depending on the state of the overall conditional
 * block. For example, when the condition in an IF statement 
 * evaluates to true, then all the other blocks within the conditional
 * block set are not executed.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import tdlUtils          from './TdlUtils.js';
import TemplateGlobalContext from './TemplateGlobalContext.js';
import TemplateStatement     from './TemplateStatement.js';

//===== Class Definition =====
/**
 * is a exported list containing the list of TDL statements 
 * considered as constituting conditional statements.
 */
export const LIST_OF_CONDITIONAL_TERMS 
           = [ 'IF',
               'IF_N_SET',
               'IF_SET',
               'IF_NOT_SET',
               'IF_DEF',
               'IF_NOT_DEF',
               'ELSE_IF',
               'ELSIF',
               'ELSE',
               'ENDIF'
             ];

export default  class ConditionalCodeBlock
{ //===== Private
  /**
   * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
   * @type { TemplateGlobalContext }
   * @private
   */
  #templateGlobalContext;
  #conditionalStatement;
  #hasBeenProcessed;
  #logicExpression;
  #logicResult;
  #statementsProcessedCount;
  
  //===== Constructors 
  constructor ( templateGlobalContext )
  { if ( !templateGlobalContext )
    { console.log ( '--*** No TemplateGlobalContext provided to ConditionalCodeBlock, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    templateGlobalContext.consoleTrace ( 'Starting ConditionalCodeBlock Constructor' );
    this.#templateGlobalContext    = templateGlobalContext || new TemplateGlobalContext();
    this.#statementsProcessedCount = 0;
    this.#logicResult              = false;
    this.#hasBeenProcessed         = false;
    templateGlobalContext.consoleTrace ( 'Finishing ConditionalCodeBlock Constructor' );
  } // End constructor

  //===== Getters
    getTemplateGlobalContext()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getTemplateGlobalContext Constructor' );
      return this.#templateGlobalContext;
    } // End function getTemplateGlobalContext
    
    getConditionalStatement()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getConditionalStatement -> ' + this.#conditionalStatement);
      return this.#conditionalStatement;
    } // End function getConditionalStatement

    getHasBeenProcessed()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getHasBeenProcessed -> ' + this.#hasBeenProcessed);
      return this.#hasBeenProcessed;
    } // End function getHasBeenProcessed

    getLogicExpression()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getLogicExpression -> ' + this.#logicExpression);
      return this.#logicExpression;
    } // End function getLogicExpression
    
    getLogicResult()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getLogicResult -> ' + this.#logicResult);
      return this.#logicResult;
    } // End function getLogicResult
    
    getStatementsProcessedCount()
    { this.#templateGlobalContext.consoleTrace ( 'Executing getStatementsProcessedCount -> ' + this.#statementsProcessedCount);
      return this.#statementsProcessedCount;
    } // End function getStatementsProcessedCount

    statementsProcessed()
    { let localResult = this.#statementsProcessedCount > 0;
      this.#templateGlobalContext.consoleTrace ( 'Executing statementsProcessed -> ' + localResult );
      return localResult;
    } // End function statementsProcessed

    isProcessable()
    { // console.log ( '$$$$$$$$$$$$ Boolean ( this.#logicResult ) ->' + Boolean ( this.#logicResult  ) );
      // console.log ( 'this.statementsProcessed()                 ->' + this.statementsProcessed()  );
      // console.log ( 'this.#hasBeenProcessed                     ->' + this.#hasBeenProcessed  );
      let localResult
            = Boolean ( this.#logicResult  );            
              //&& this.statementsProcessed() < 1;
      if ( localResult && ! this.#hasBeenProcessed )
      { this.#hasBeenProcessed = true;
      } // End if 
      this.#templateGlobalContext.consoleTrace ( 'Executing isProcessable -> ' + localResult );
      return localResult;
    } // End isProcessable
    
  //===== Setters

    setConditionalStatement ( conditionalStatement )
    { this.#templateGlobalContext.consoleTrace ( 'Starting setConditionalStatement ->\n' + conditionalStatement?.toJSON() );
      this.#conditionalStatement = conditionalStatement;
      this.#logicExpression      = conditionalStatement.getArgumentText();
      this.#templateGlobalContext.consoleTrace ( 'Finishing setConditionalStatement' );
    } // End function setConditionalStatement

    setLogicalResult ( logicExpression )
    { this.#templateGlobalContext.consoleTrace ( 'Starting setLogicalResult -> ' + logicExpression );
      let tdlUtils = this.#templateGlobalContext.getTdlUtils ();
      this.#logicResult = false;
      try
      { if ( tdlUtils.isOnOrOff ( logicExpression ) )
        { this.#logicResult = this.#logicResult = tdlUtils.isOn ( logicExpression );
        } // End if
        else
        { this.#logicResult = Boolean ( eval ( logicExpression ) );
        } // End else
      } // End try
      catch ( error )
      { this.#templateGlobalContext.consoleTrace  ( '--*** WARNING: logicExpression -> "' + logicExpression + '" is not valid! ' + error );
        console.warn ( '--*** WARNING: logicExpression -> "' + logicExpression + '" is not valid! ' + error );
      } // End catch
      this.#templateGlobalContext.consoleTrace ( 'Finishing setLogicalResult -> ' + this.#logicResult );
    } // End function setLogicalResult


    setLogicExpression ( logicExpression )
    { this.#templateGlobalContext.consoleTrace ( 'Starting setLogicExpression -> ' + logicExpression );
      if ( typeof logicExpression === 'string' ) 
      { logicExpression = logicExpression?.trim();
      } // ENd if
      if ( typeof logicExpression === 'string' && logicExpression.startsWith ( '(' ) && logicExpression.endsWith ( ')' ) )
      { logicExpression = logicExpression.substring(1, logicExpression.length-1);
        logicExpression = logicExpression.trim();
      } // End if
      if ( typeof logicExpression === 'undefined' ) // || (! Boolean (logicExpression))  )
      { logicExpression = '1===1';
      } // End if
      else if ( typeof logicExpression === 'boolean' )
      { if ( logicExpression )
        { logicExpression = '1===1';
        } // End if
        else
        { logicExpression = '1===0'
        } // End if
      } // End if
      this.#logicExpression = logicExpression ;
      //console.log ( '--!!!!! logicExpression : ' + logicExpression );
      //console.log ( '--!!!!! eval ( logicExpression ) : ' + eval ( logicExpression ) );
      this.setLogicalResult ( logicExpression );
      //console.log ( '--!!!!! this.#logicResult : ' + this.#logicResult );
      this.#statementsProcessedCount = 0;
      this.#templateGlobalContext.consoleTrace ( 'Finishing setLogicExpression ' );
    } // End function setLogicExpression

    setHasBeenProcessed ( newState )
    { this.#templateGlobalContext.consoleTrace ( 'Executing setHasBeenProcessed -> ' + newState );
      this.#hasBeenProcessed = Boolean ( newState );
    } // End function setHasBeenProcessed
    

    resetStatementCounter()
    { this.#templateGlobalContext.consoleTrace ( 'Starting incrementStatementCounter' );
      if ( ! this.#statementsProcessedCount ) 
      { this.#statementsProcessedCount = 0;
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing incrementStatementCounter -> ' + this.#statementsProcessedCount );
    } // End function resetStatementCounter

    incrementStatementCounter()
    { this.#templateGlobalContext.consoleTrace ( 'Starting incrementStatementCounter' );
      if ( ! this.#statementsProcessedCount ) 
      { this.#statementsProcessedCount = 0;
      } // End if
      this.#statementsProcessedCount++;
      this.#hasBeenProcessed = true;
      this.#templateGlobalContext.consoleTrace ( 'Finishing incrementStatementCounter -> ' + this.#statementsProcessedCount );
    } // End function incrementStatementCounter

    processConditionalStatement ( lineOfCode )
    { this.#templateGlobalContext.consoleTrace ( 'Starting processConditionalStatement -> ' + lineOfCode );
      this.#conditionalStatement =  new TemplateStatement ( lineOfCode, this.#templateGlobalContext );
      let conditionalOperation = this.#conditionalStatement.getKindOfText()[0];
      let logicExpression = this.#conditionalStatement.getArgumentText();
      console.log ('##### conditionalOperation : ' + conditionalOperation );
      if ( conditionalOperation === 'IF' )
      { this.setLogicExpression ( logicExpression );
      } // End if
      else if ( ( conditionalOperation === 'ELSEIF' 
                  || conditionalOperation === 'ELSIF'
                ) && ( ! this.statementsProcessed() )
         )
      { console.log ( '##### isProcessable()                 : ' +  this.isProcessable() );
        console.log ( '##### this.#statementsProcessedCount  : ' +  this.#statementsProcessedCount );
        if ( this.isProcessable() && this.#statementsProcessedCount > 0 )
        { this.setLogicExpression ( this.#conditionalStatement.getArgumentText() );
        } // End if
        else
        { this.setLogicExpression ( this.#conditionalStatement.getArgumentText() );
          this.incrementStatementCounter();
        } // End else
        this.#logicResult = false
        console.log ( '$$$$$ this.#logicResult               : ' +  this.#logicResult );
      } // End if
      else
      { this.incrementStatementCounter();
      }  // End else
      this.#conditionalStatement;
      this.#templateGlobalContext.consoleTrace ( 'Finishing processConditionalStatement ' );
    } // End function processConditionalStatement

  //===== Public Utilities
    toJSON()
    { let jsonString = "";
      jsonString
        = '{\n'
          // + '"templateGlobalContext"     ,  "' + this.#templateGlobalContext    + '",' + '\n'  
          + '"conditionalStatement"      ,  "' + this.#conditionalStatement?.toJSON()  + '",' + '\n'  
          + '"logicExpression"           ,  "' + this.#logicExpression                + '",' + '\n'  
          + '"logicResult"               ,  "' + this.#logicResult                    + '",' + '\n'  
          + '"statementsProcessedCount"  ,  "' + this.#statementsProcessedCount       + '",' + '\n' 
          + '"hasBeenProcessed"          ,  "' + this.#hasBeenProcessed               + '"' + '\n'  
          + '}\n'
      return jsonString;
    } // End function toJSON

} // End ConditionalCodeBlock

function unitTestCodeBlockStack()
{ console.log ( '\n\n========== ConditionalCodeBlock ==========' );
  console.log ( '===== Step 1.0' );
  console.log ( ' -- Setup the TemplateGlobalContext' ); 
  let templateGlobalContext = new TemplateGlobalContext();
  templateGlobalContext.setTraceState ( false );
  
  let templateLineOfCode;
  let templateStatement;
  let conditionalCodeBlock;
  let codeProcessed;

  console.log ( '===== Step 1.1' );
  templateLineOfCode    = "_#IF    1+3 < 5    ";
  console.log ( '-- The line of text to process, templateLineOfCode -> "' + templateLineOfCode + '"' );
  templateStatement     = new TemplateStatement ( templateLineOfCode, templateGlobalContext );
  console.log ( '-- templateStatement ->\n' + templateStatement.toJSON() );
  console.log ( '-- Setup a ConditionalCodeBlock' );
  conditionalCodeBlock  = new ConditionalCodeBlock ( templateGlobalContext );
  console.log ( '-- Parse the templateLineOfCode -> "' + templateLineOfCode + '"' );
  codeProcessed = conditionalCodeBlock.processConditionalStatement ( templateLineOfCode );
  console.log ( '-- codeProcessed            : ' + codeProcessed );
  console.log ( '-- conditionalCodeBlock ->\n ' +  conditionalCodeBlock.toJSON() );
  

  console.log ( '===== Step 1.1' );
  templateLineOfCode    = "  Just a line of text";
  console.log ( '-- The line of text to process, templateLineOfCode -> "' + templateLineOfCode + '"' );
  templateStatement     = new TemplateStatement ( templateLineOfCode, templateGlobalContext );
  console.log ( templateStatement.toJSON() );
  conditionalCodeBlock  = new ConditionalCodeBlock ( templateGlobalContext );
  codeProcessed = conditionalCodeBlock.processConditionalStatement ( templateLineOfCode );
  console.log ( '-- set up the first statement as: "' + templateLineOfCode + '"' );
  console.log ( '-- codeProcessed : ' + codeProcessed );
  console.log ( conditionalCodeBlock.toJSON() );
  console.log ( '-- isProcessable : ' + conditionalCodeBlock.isProcessable() );

} // End function unitTestCodeBlockStack

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ unitTestCodeBlockStack();
} // End if
