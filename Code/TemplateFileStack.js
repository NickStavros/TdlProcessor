/**
 * File: TemplateFileStack.js
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
 * @class TemplateFileStack
 * @description is a stack of template file descriptors allowing 
 * the nesting of template files. Whenever a new
 * file is identified in the template, a new TemplateFIle
 * is added to the stack. When the template is completed, the 
 * TemplateFile is popped from the stack.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */
//===== Imports =====
import TemplateGlobalContext           from './TemplateGlobalContext.js';
import TemplateFile                    from './TemplateFile.js';

//===== Class Definition =====
export default class TemplateFileStack
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #stack;
    #stackArray;
    #stackDepth;

  //===== Constructors 
  constructor ( filename,  templateGlobalContext )
  { if ( !templateGlobalContext )
    { console.log ( '--*** No TemplateGlobalContext provided to ConditionalCodeStack, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if
    if ( !filename )
    { console.log ( '--*** Filename must be defined' );
      throw 'Filename can not be undefined';
    } // End if
    templateGlobalContext.consoleTrace ( 'Starting TemplateFileStack Constructor -> ' + filename );
    this.#templateGlobalContext = templateGlobalContext;
    this.reset ( filename );
    templateGlobalContext.consoleTrace ( 'Finishing TemplateFileStack Constructor' );
  } // End constructor

  reset ( filename )
  { this.#templateGlobalContext.consoleTrace ( 'Starting reset -> ' + filename );
    this.#stack        = new Array();
    this.#stack[0]     = new TemplateFile ( filename, this.#templateGlobalContext );
    this.#stackDepth   = this.#stack?.length;
    this.#stackArray   = Array.from ( this.#stack[0] );
    this.#templateGlobalContext.consoleTrace ( 'Finishing reset' );
  } // End function reset

   
   //===== Getters

    getCurrentTemplateFile()
    { this.#templateGlobalContext.consoleTrace ( 'Starting templateFileStack.getCurrentTemplateFile' );
      let localResult = this.#stack[this.#stack.length -1 ];
      this.#templateGlobalContext.consoleTrace ( 'Finishing templateFileStack.getCurrentTemplateFile -> ' + localResult );
      return localResult;
    } // End function getCurrentTemplateFile

    getFileContents()
    { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.getFileContents ');
      return this.getCurrentTemplateFile().getFileContents();
    } // End function getFileContents
  
     getFileName()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.getFileName' );
       return this.getCurrentTemplateFile().getFileName();
     } // End function getFileName

     getDepth()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.getFileName' );
       return this.#stack.length;
     } // End function getDepth
  
     getLineNumber()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.getLineNumber ' );
       return this.getCurrentTemplateFile().getLineNumber();
     } // End function getLineNumber
  
     getCurrentLine()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.getCurrentLine ' );
       return this.getCurrentTemplateFile().getCurrentLine();
     } // End function getCurrentLine
  
     updateCurrentLine ( lineNumber, newLineOfText )
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.updateCurrentLine ' );
       return this.getCurrentTemplateFile().updateCurrentLine ( lineNumber, newLineOfText );
     } // End function updateCurrentLine
  
     clearContents()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.clearContents' );
       this.getCurrentTemplateFile().clearContents();
     } // End function clearContents
    
     gotoBottom()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.gotoBottom' );
       this.getCurrentTemplateFile().gotoBottom();
     } // End function gotoBottom

     gotoTop()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.gotoTop' );
       this.getCurrentTemplateFile().gotoTop();
     } // End function gotoTop
  
     next()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.next' );
       return this.getCurrentTemplateFile().next();
     } // End function next
  
     previous()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.previous' );
       return this.getCurrentTemplateFile().previous();
     } // End function previous
  
     popNext()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.popNextLine' );
       return this.getCurrentTemplateFile().popNextLine();
     } // End function popNextLine
  
     loadTemplateFile ( filename )
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.loadTemplateFile' );
       return this.getCurrentTemplateFile().loadTemplateFile ( filename );
     } // End Function loadTemplateFile
  
     isEmpty ( )
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.isEmpty ' );
       return this.getCurrentTemplateFile().isEmpty();
     } // End function isEmpty
  
     isEof ( )
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.isEof');
       return  this.getCurrentTemplateFile().isEof () ;
     } // End function isEmpty

     notifyIsEof()
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.notifyIsEof');
       return  this.getCurrentTemplateFile().notifyIsEof () ;
     } // End function isEmpty

     setLineNumber ( newLineNumber )
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.setLineNumber -> ' + newLineNumber );
       return this.getCurrentTemplateFile().setLineNumber ( newLineNumber );
     } // End function setLineNumber

     setFileContents ( newFileContents, newLineNumber )
     { this.#templateGlobalContext.consoleTrace ( 'Executing templateFileStack.setFileContents ');
       this.getCurrentTemplateFile().setFileContents ( newFileContents, newLineNumber );
     } // End function setFileContents
   
     popTemplateFile()
     { this.#templateGlobalContext.consoleTrace ( 'Starting templateFileStack.popTemplateFile' );
       let localResult = this.getCurrentTemplateFile();
       if ( this.#stack.length > 1 )
       { this.#templateGlobalContext.getLocalVariableStack().popLocalVariablesOnStack();
         localResult = this.#stack.pop();
         this.#stackDepth--;
       } // End if
       if ( this.#stack.length !== this.#stackDepth )
       { this.#templateGlobalContext.consoleTrace ( '--*** Integrity Error'); 
         this.#stackDepth = this.#stack.length;
       } // End if
       this.#stackArray = Array.from ( this.#stack );
       this.#templateGlobalContext.consoleTrace ( 'Finishing templateFileStack.popTemplateFile -> ' +  this.#stackDepth );
       return localResult;
     } // End function popTemplateFile

     pushTemplateFile ( templateFile )
     { this.#templateGlobalContext.consoleTrace ( 'Starting templateFileStack.pushTemplateFile ->\n' + templateFile );
       this.#stack.push ( templateFile );
       this.#templateGlobalContext.getLocalVariableStack().pushLocalVariablesOnStack();
       this.#stackDepth = this.#stack.length;
       this.#stackArray = Array.from ( this.#stack );
       this.#templateGlobalContext.consoleTrace ( 'Finishing templateFileStack.pushTemplateFile -> ' + this.#stackDepth );
     } // End function pushTemplateFile

     setSplice ( startingAt, arrayToSpliceIn )
     { this.getCurrentTemplateFile().setSplice ( startingAt, arrayToSpliceIn );
     } // End setSplice

     toJSON()
     { this.#templateGlobalContext.consoleTrace ( 'Starting toJSON '  );
       let jsonString = "";
       jsonString
              = '{\n'
              + '"stackDepth"                ,  "' + this.#stackDepth               + '",' + '\n'  
              + '"stack"                     ,  \n';
       this.#stackArray.forEach
              ( ( element, index ) => 
                  { jsonString += index + ': typeOf  ' + typeof element + ' - '  + element; // @@@@@@ .toJSON(); 
                  }
              );
       jsonString = jsonString + '}\n';
       this.#templateGlobalContext.consoleTrace ( 'Finishing toJSON ->\n'  + jsonString );
       return jsonString;
     } // end function toJSON
 

} // End class TemplateFileStack

function unitTestTemplateFileStack ()
{ console.log ( "--========== starting unitTestProcessTemplate ==========");
  const filename_1 = './Templates/macro_tester.template';
  const filename_2 = './Templates/HelloWorld.template';
  let trace = false;
  let templateGlobalContext 
    = new TemplateGlobalContext
          ( '_',
            '#',
            process.cwd(),
            trace
          );
  templateGlobalContext.setTraceState ( false );
  console.log ( "===== Step 1.0" );
  let templateFileStack = new TemplateFileStack ( filename_1, templateGlobalContext );
  templateGlobalContext.setTraceState ( true );
  console.log ( templateFileStack.getFileContents() );
  console.log ( '=== nextLine   1 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  templateGlobalContext.setTraceState ( false );
  console.log ( '=== nextLine   2 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  console.log ( '=== nextLine   3 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  console.log ( '=== nextLine   4 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  console.log ( '=== nextLine   5 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  

  templateFileStack.pushTemplateFile ( new TemplateFile ( filename_2, templateGlobalContext ) );
  console.log ( '=========== Depth two =========' );
  console.log ( '=== getDepth() :  ' + templateFileStack.getDepth() );
  console.log ( '=== nextLine   1 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  console.log ( '=== nextLine   2 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  //console.log ( templateFileStack.toJSON() );

  templateFileStack.popTemplateFile();
  console.log ( '=========== Depth One =========' );
  console.log ( '=== getDepth() :  ' + templateFileStack.getDepth() );
  console.log ( '=== nextLine   6 :  ' + ( templateFileStack.getLineNumber()+1 ) + '] ' + templateFileStack.getCurrentLine() );
  
  //console.log ( templateFileStack.toJSON() );
} // End function unitTestTemplateFileStack

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestTemplateFileStack();
} // End if