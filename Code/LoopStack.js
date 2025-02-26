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

//===== Import =====
import TemplateGlobalContext from './TemplateGlobalContext.js';
import LoopBlock             from './LoopBlock.js';

//===== Class Definition =====
export default class LoopStack
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
    constructor ( templateGlobalContext  )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to LoopStack, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      this.#templateGlobalContext = templateGlobalContext;
      this.#templateGlobalContext.consoleTrace ( 'Starting LoopStack Constructor'  );
      this.reset ( );
      this.#templateGlobalContext.consoleTrace ( 'Finishing LoopStack Constructor' );
    } // End constructor
  
    reset ( )
    { this.#templateGlobalContext.consoleTrace ( 'Starting reset ' );
      this.#stack        = new Array();
      this.#stack[0];
      this.#stackDepth   = this.#stack?.length;
      this.#stackArray   = new Array(); // Array.from ( this.#stack[0] );
      this.#templateGlobalContext.consoleTrace ( 'Finishing reset' );
    } // End function reset

   
   //===== Getters
     
     getCurrentLoopBlock()
     { this.#templateGlobalContext.consoleTrace ( 'Starting LoopStack.getCurrentLoopBlock ->' + (this.#stack.length-1) );
       let localResult = this.#stack[this.#stack.length-1 ];
       this.#templateGlobalContext.consoleTrace ( 'Finishing LoopStack.getCurrentLoopBlock -> ' + localResult );
       return localResult;
     } // End function getCurrentLoopBlock
     getBeginLineNumber()
     { let localResult = 
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getBeginLineNumber -> ' + this.getCurrentLoopBlock().getBeginLineNumber() );
       return this.getCurrentLoopBlock().getBeginLineNumber();
     } // End function getBeginLineNumber
     getCurrentLineNumber()
     { let localResult = this.getCurrentLoopBlock().getCurrentLineNumber();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getCurrentLineNumber -> ' + localResult );
       return localResult;
     } // End function getCurrentLineNumber
     getCurrentStatement()
     { let localResult = this.getCurrentLoopBlock().getCurrentStatement();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getCurrentStatement -> "' + localResult + '"' );
       return localResult;
     } // End function getCurrentStatement
     getCursorDefinitions()
     { let localResult = this.getCurrentLoopBlock().getCursorDefinitions();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getCursorDefinitions -> ' + localResult );
       return localResult;
     } // End function getCursorDefinitions
     getEndLineNumber()
     { let localResult = this.getCurrentLoopBlock().getEndLineNumber();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getEndLineNumber -> ' + localResult );
       return localResult;
     } // End function getEndLineNumber
     getLoopCounter()
     { let localResult = this.getCurrentLoopBlock().getLoopCounter();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getLoopCounter -> ' + localResult );
       return localResult;
     } // End function getCursorDefinitions
     getLoopName()
     { let localResult = this.getCurrentLoopBlock().getLoopName();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.getLoopName -> ' + localResult );
       return localResult;
     } // End function getLoopName     
     isValidBlock()
     { let localResult = this.getCurrentLoopBlock().isValidBlock();
       this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.isValidBlock -> ' + localResult );
       return localResult;
     } // End function isValidBlock
     getOriginalTableRows()
     { return this.getCurrentLoopBlock().getOriginalTableRows();
     } // End getOriginalTableRows
     
   //===== Setters

     setLoopName ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setLoopName -> ' + newValue );
       this.getCurrentLoopBlock().setLoopName ( newValue );
     } // End function setLoopName     
     setValidBlock ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setValidBlock -> ' + newValue );
       this.getCurrentLoopBlock().setValidBlock ( newValue );
     } // End function setValidBlock
     setBeginLineNumber ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setBeginLineNumber -> ' + newValue );
       this.getCurrentLoopBlock().setBeginLineNumber ( newValue );
     } // End function setBeginLineNumber
     setCurrentLineNumber ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setCurrentLineNumber -> ' + newValue );
       this.getCurrentLoopBlock().setCurrentLineNumber ( newValue );
     } // End function setCurrentLineNumber
     setEndLineNumber ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setCurrentLineNumber -> ' + newValue );
       this.getCurrentLoopBlock().setEndLineNumber ( newValue );
     } // End function setEndLineNumber
     setCursorDefinition ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setCursorDefinition -> ' + newValue );
     this.getCurrentLoopBlock().setCursorDefinition ( newValue );
     } // End function setCursorDefinition
     setTemplateFile ( newValue )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.setTemplateFile -> ' );
       this.getCurrentLoopBlock().setTemplateFile ( newValue );
     } // End function setCursorDefinition
     setOriginalTableRows
       ( originalTableRows )
     { this.getCurrentLoopBlock().setOriginalTableRows ( originalTableRows );
     } // End setOriginalTableRows

//===== Utility Operations

   addLoopBlock ( loopName, currentLineNumber, fileContents, templateGlobalContext )
   { this.#templateGlobalContext.consoleTrace ( 'Starting LoopStack.addLoopBlock -> ' + loopName );
     let localResult = false;
     let loopBlock 
       = new LoopBlock 
           ( trim ( loopName ), 
              currentLineNumber, 
              fileContents, 
              templateGlobalContext
            );
     if ( loopBlock )
     { localResult = this.pushLoopBlock ( loopBlock );
     } // End if
     else
     { localResult = false;
     } // End else
     this.#templateGlobalContext.consoleTrace ( 'Finishing LoopStack.addLoopBlock -> ' + localResult );
     return localResult;
   } // End function addLoopBlock


   popLoopBlock()
   { this.#templateGlobalContext.consoleTrace ( 'Starting LoopStack.popLoopBlock' );
     let localResult = this.getCurrentLoopBlock();
     if ( this.#stack.length > 1 )
     { localResult = this.#stack.pop();
       this.#stackDepth--;
     } // End if
     if ( this.#stack.length !== this.#stackDepth )
     { this.#templateGlobalContext.consoleTrace ( '--*** Integrity Error'); 
       this.#stackDepth = this.#stack.length;
     } // End if
     this.#stackArray = Array.from ( this.#stack );
     this.#templateGlobalContext.consoleTrace ( 'Finishing LoopStack.popLoopBlock -> ' +  this.#stackDepth );
     return localResult;
   } // End function popLoopBlock


   pushLoopBlock ( loopBlock )
   { this.#templateGlobalContext.consoleTrace ( 'Starting LoopStack.pushLoopBlock ' + loopBlock.getLoopName() );
     let localResult = true;
     this.#stack.push ( loopBlock );
     this.#stackDepth = this.#stack.length;
     this.#stackArray = Array.from ( this.#stack );
     this.#templateGlobalContext.consoleTrace ( 'Finishing LoopStack.pushLoopBlock ' + loopBlock.getLoopName() );
     return localResult;
   } // End function pushLoopBlock

     //===== Utilities
     breakTheLoop ()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.breakTheLoop' );
       return this.getCurrentLoopBlock().breakTheLoop();
     } // End function breakTheLoop

     EndOfLoop ()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.EndOfLoop' );
       return this.getCurrentLoopBlock().EndOfLoop();
     } // End function EndOfLoop

     nextInLoop ()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.nextInLoop' );
       return this.getCurrentLoopBlock().nextInLoop();
     } // End function nextInLoop

     previousInLoop ()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.previousInLoop' );
       return this.getCurrentLoopBlock().previousInLoop();
     } // End function previousInLoop

     topOfLoop ()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.topOfLoop' );
       return this.getCurrentLoopBlock().topOfLoop();
     } // End function topOfLoop

     moreDataRecords ()
     { let localResult = this.getCurrentLoopBlock().moreDataRecords();
      this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.moreDataRecords -> ' + localResult);
       return localResult;
     } // End function moreDataRecords

     moveRecordLocation ( numberOfRecords )
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.moveRecordLocation -> ' + numberOfRecords );
       return this.getCurrentLoopBlock().moveRecordLocation ( numberOfRecords );
     } // End function moveRecordLocation
     
     moveToNextRecord ()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.moveToNextRecord' );
       return this.getCurrentLoopBlock().moveToNextRecord();
     } // End function moveToNextRecord

     exitTheLoop()
     { this.#templateGlobalContext.consoleTrace ( 'Executing LoopStack.exitTheLoop' );
       if ( typeof this.getCurrentLoopBlock() === 'undefined' )
       { let errorMessage = '--+++ Can not use BREAK outside of a LOOP, BREAK ignored';
         console.log ( errorMessage );
         return;
       } // End if
       else
       { return this.getCurrentLoopBlock().exitTheLoop();
       } // End else
     } // End function exitTheLoop

} // End class LoopStack

function unitTestLoopStack()
{ console.log ( "--========== starting unitTestLoopStack ==========");
  let templateGlobalContext
        = new TemplateGlobalContext
              ( "_",
                "#",
                process.cwd()
             );
  let fileIO = templateGlobalContext.getFileIO();
  let filename = "./Templates/loopExample.template";
  let fileContents = fileIO.synchronouslyReadFile ( filename );
  let loopName = 'testLoop';
  let currentLineNumber = 0;
  templateGlobalContext.setTraceState ( false );
  let loopBlock = new LoopBlock( loopName, currentLineNumber, fileContents, templateGlobalContext );
  console.log ( '#### loopBlock ->' + loopBlock.toJSON() );
  console.log ( '%%%%% 1800' );
  templateGlobalContext.setTraceState ( false );
  console.log ( '%%%%% 1900' );
  let loopStack = new LoopStack ( templateGlobalContext );
  loopStack.addLoopBlock ( loopName, currentLineNumber, fileContents, templateGlobalContext );
  console.log ( '%%%%% 19100' );
  console.log ( '#### loopName -> ' + loopStack.getLoopName() );
  console.log ( '%%%%% 19900' );
  loopStack.pushLoopBlock ( loopBlock );
} // End unitTestLoopStack

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestLoopStack();
} // End if
