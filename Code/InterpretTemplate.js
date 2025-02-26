/**
 * File: InterpretTemplate.js
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
 * @class InterpretTemplate
 * @description is responsible for reading, interpreting and processing 
 * the template
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext           from './TemplateGlobalContext.js';
import TemplateStatement               from './TemplateStatement.js';
import ConditionalCodeBlock,
       { LIST_OF_CONDITIONAL_TERMS
       }                               from './ConditionalCodeBlock.js';
import ConditionalCodeStack            from './ConditionalCodeStack.js';
import TemplateFile                    from './TemplateFile.js';
import TemplateFileStack               from './TemplateFileStack.js';
import process                         from 'process';
import * as FileSystem                 from 'fs';
import * as Path                       from 'path';
import MetaSettings                    from './MetaSettings.js';
import * as TdlUtils                   from './TdlUtils.js';

//===== Class Definition =====
export default class InterpretTemplate
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #fileContents = "";
    #fileName;
    #templateFileStack;
    #lineNumber;
    #conditionalCodeStack;

   //===== Constructors 
   constructor ( templateGlobalContext )
   { if ( !templateGlobalContext )
     { console.log ( '--*** No TemplateGlobalContext provided to InterpretTemplate, creating new local copy.' );
       templateGlobalContext = new TemplateGlobalContext ( );
     } // End if
     templateGlobalContext.consoleTrace ( 'Starting InterpretTemplate Constructor');
     this.#fileName;
     this.#fileContents          = [];
     this.#lineNumber            = -1;
     this.#templateGlobalContext = templateGlobalContext;
     this.#templateGlobalContext.consoleTrace ( '-- Finishing InterpretTemplate Constructor' );
   } // End constructor TemplateGlobalSpace

   getFileName()
   { this.#templateGlobalContext.consoleTrace ( 'Executing InterpretTemplate.getFileName -> ' + this.#fileName);
     return this.#fileName;
   } // End function getTemplateFile

   getTemplateFile()
   { this.#templateGlobalContext.consoleTrace ( 'Executing InterpretTemplate.getTemplateFile');
     return this.#templateFileStack.getCurrentTemplateFile();
   } // End function getTemplateFile

   getTemplateFileStack()
   { this.#templateGlobalContext.consoleTrace ( 'Executing InterpretTemplate.getTemplateFileStack');
     return this.#templateFileStack;
   } // End function getTemplateFileStack

   toJSON()
   { this.#templateGlobalContext.consoleTrace ( 'Starting toJSON');
     let jsonText
       =  "\n{\n"
          + "  \"fileContents\"           : \"" + JSON.stringify ( this.#fileContents, null, "\t" ) + "\",\n"
          + "  \"fileName\"               : \"" + this.#fileName + "\",\n"
          + "  \"templateGlobalContext\"  : \"" + this.#templateGlobalContext.toJSON() + "\",\n"
          + "  \"lineNumber\"             : \"" + this.#lineNumber + "\"\n"
          +"}\n";
      this.#templateGlobalContext.consoleTrace ( 'Finishing toJSON -> \n' + jsonText );
     return jsonText
   } // End function toJSON

   processTemplate ( inputFileName, outputFileName  )
   { this.#fileContents          = inputFileName;
     this.#templateFileStack     = new TemplateFileStack ( inputFileName,  this.#templateGlobalContext );
     this.#templateFileStack.gotoTop();
     let templateStatement;
     let lineCounter            = -1;
     let currentMetaIndent      = 0;
     let nonMetaIndent          = 0;
     let currentIndentLevel     = 0;
     let lastLineWasMetaCmd     = false;
     let trace                  = this.#templateGlobalContext.getTraceState();
     let conditionalCodeStack   = new ConditionalCodeStack ( this.#templateGlobalContext );
     let tdlUtils               = this.#templateGlobalContext.getTdlUtils();
     let environmentSettings    = this.#templateGlobalContext.getEnvironmentSettings();
     let metaSettings           = this.#templateGlobalContext.getMetaSettings()
   
     while ( !this.#templateFileStack.isEof() )
     { let rawLineOfText        = this.#templateFileStack.getCurrentLine();
       lineCounter              = this.#templateFileStack.getLineNumber();
       let currentLineOfText    = rawLineOfText;
       // console.log ( '#####  ' + TdlUtils.RULER );
       // console.log ( '#####  ' + currentLineOfText );
       let metaEchoInput        = metaSettings.get ( 'metaEchoInput' );
       let metaEchoOutput       = metaSettings.get ( 'metaEchoOutput' );
       let metaEchoComment      = metaSettings.get ( 'metaEchoComment' );
       let metaEchoInfo         = metaSettings.get ( 'metaEchoInfo' );
       let metaCommentIndicator = metaSettings.get ( 'metaCommentIndicator' );
       let metaCommandIndicator = metaSettings.get ( 'metaCommandIndicator' );
       let metaConditionalOp    = this.#templateGlobalContext.getMetaSettings().get ( 'metaConditionalOp' );
       let metaConditionalDiv   = this.#templateGlobalContext.getMetaSettings().get ( 'metaConditionalDiv' );
       let suppressBlanks       = this.#templateGlobalContext.get ( 'suppressBlanks' ).trim().toLowerCase();
       let expandVariables      = environmentSettings.get ( 'expandVariables' ).trim().toLowerCase();
       expandVariables          = TdlUtils.isOn ( expandVariables );
       let addNewLine           = true;
       let resultOfScan;
       let commentText;
       let templateCommand;
 
       //========== Process Line Directives
           //===== Read Template Literal Lines
           resultOfScan             = tdlUtils.readTemplateLiteral ( this.#templateFileStack.getFileContents(), lineCounter, currentLineOfText );
           let foundTemplateLiteral = resultOfScan[0];
           if ( foundTemplateLiteral )
           { lineCounter              = resultOfScan[1]+1;
             currentLineOfText        = resultOfScan[2];
             this.#templateFileStack.setFileContents ( resultOfScan[3],  lineCounter );
           } // End if    
           
           //===== Read Continued Lines
           resultOfScan             = tdlUtils.readContinuedLine ( this.#templateFileStack.getFileContents(), lineCounter, currentLineOfText );
           lineCounter              = resultOfScan[0];
           currentLineOfText        = resultOfScan[1];
     
           //===== Process Comments      
           resultOfScan             = tdlUtils.processComments 
                                       ( this.#templateFileStack.getFileContents(), 
                                         lineCounter, 
                                         currentLineOfText,
                                         conditionalCodeStack.isProcessable()
                                       );
           lineCounter              = resultOfScan[0];
           currentLineOfText        = resultOfScan[1];
           commentText              = resultOfScan[2];
     
           this.#templateFileStack.updateCurrentLine ( lineCounter, currentLineOfText );
           currentLineOfText = this.#templateFileStack.setLineNumber ( lineCounter );
           
           if ( expandVariables )
           { currentLineOfText        = this.#templateGlobalContext.getTdlUtils().expandVariableNames ( currentLineOfText );
             commentText              = this.#templateGlobalContext.getTdlUtils().expandVariableNames ( commentText );
           } // End if
           currentLineOfText        = this.#templateGlobalContext.getHostCommands().executeHostCmd ( currentLineOfText ); 
     
           //===== Process Question Operators
           if ( currentLineOfText.trim().substring ( 0, metaConditionalOp.length ) === metaConditionalOp )
           { currentLineOfText        = tdlUtils.processQuestionOperator ( currentLineOfText,  ); 
           }
           lineCounter              = this.#templateFileStack.getLineNumber() + 1;
           templateStatement        = new TemplateStatement ( currentLineOfText, this.#templateGlobalContext );

       // console.log ( '^^^^ templateStatement ->\n' + templateStatement.toJSON() );
      
       //========== Process Template Commands
       if ( metaEchoInput ) 
       { console.log ( '--> ' + this.getTemplateFileStack().getDepth()
                              + ':'
                              + lineCounter + '] ' 
                              + currentLineOfText 
                     );
         let a = 'dummy';
       } // End if
 
       if ( templateStatement.isMetaCommand() )
       { lastLineWasMetaCmd = true;
         currentMetaIndent = templateStatement.getIndent();
         templateCommand = templateStatement.getKindOfText()[0];        
         // console.log ( '##### templateCommand  : ' +  templateCommand );
         //----- DEBUG
         if ( ( templateCommand === 'DEBUG' || templateCommand === 'TRACE') && conditionalCodeStack.isProcessable() )
         { let debugText = templateStatement.getArgumentText().split( /\s/ )[0].toUpperCase();
           let booleanResult = Boolean ( debugText );
           if ( tdlUtils.isOn (debugText ) )
           { booleanResult = true;
           } // end if
           else if ( tdlUtils.isOff (debugText ) )
           { booleanResult = false;
           } // End else if
           this.#templateGlobalContext.setTraceState ( booleanResult );
         } // End if
        
        //----- MACRO_BEGIN
         else if ( templateCommand === 'MACRO_BEGIN' && conditionalCodeStack.isProcessable() )
         { let macroStack   = this.#templateGlobalContext.getMacroStack();
           let createResult = macroStack.createMacroDefinition 
                               ( templateStatement, 
                                 lineCounter, 
                                 this.#templateFileStack.getFileContents()  
                               );
           lineCounter      = createResult[0];
           let macroBlock   = createResult[1];
           macroStack.addMacroDefinition ( macroBlock );
           this.#templateFileStack.setLineNumber ( lineCounter );
         } // End if
         //----- MACRO_END
         else if ( templateCommand === 'MACRO_END' && conditionalCodeStack.isProcessable() )
         { let locationDetails 
                 = '--*** fileName: "' 
                   + this.#templateFileStack.getFileName() 
                   + '"\n--*** LineNumber: '
                   + ( this.#templateFileStack.getLineNumber() + 1 );
           console.log ( '--*** Encountered a MACRO_END without a previous MACRO_BEGIN' 
                         + locationDetails
                      );
         } // End if
        
         //----- CURSOR
         else if ( templateCommand === 'CURSOR' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.getCursorDefinitions().set ( currentLineOfText );
         } // End if
        
         //----- DEFINE
         else if ( templateCommand === 'DEFINE' && conditionalCodeStack.isProcessable() )
         { const argumentText = templateStatement.getArgumentText();
           const regExp = /^([a-zA-Z_][\w!@#$%^&*()\[\]{}<>?#\-:;]*)\s*(.*)/s
           const matches = argumentText.match(regExp);
           if ( matches )
           { let variableName = matches[1];
             let variableValue = matches[2];
             if ( variableName.endsWith ( TdlUtils.PSEUDO_ELEMENT ) )
             { variableName = variableName.replace(new RegExp(TdlUtils.PSEUDO_ELEMENT + "$"), "");
               this.#templateGlobalContext.getLocalVariableStack().set
                  ( variableName,  
                    variableValue 
                  );
              let variableStack = this.#templateGlobalContext.getLocalVariableStack();
              TdlUtils.definePseudoElements ( variableStack, variableName, variableValue );
            } // End if
            else
            { this.#templateGlobalContext.getLocalVariableStack().set
              ( variableName,  
                variableValue 
              );
            } // End Else 
           } // End If
           // this.#templateGlobalContext.getLocalVariableStack().set
           //   ( templateStatement.getObject(),  
           //     variableValue 
           //   );
         } // End if
        
         //----- DUMP
         else if ( templateCommand === 'DUMP' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.dumpGlobalsContext ( templateStatement.getObject() );
         } // End if
        
         //----- ECHO
         else if ( templateCommand === 'ECHO' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.getTdlUtils().processEchoCommand 
             ( lineCounter,
               templateStatement, 
               this.getTemplateFileStack().getDepth()
             );
         } // End if

         //----- EOF
         else if ( templateCommand === 'EOF' && conditionalCodeStack.isProcessable())
         { let messageText 
            = 'Process Template EOF encountered for:\nloop: '
               + this.#templateGlobalContext.getLoopStack().getCurrentLoopBlock().getLoopName()
               + ',\nfileName: "' + this.#templateFileStack.getFileName() 
              + '"\nLineNumber: ' + ( this.#templateFileStack.getLineNumber() + 1 );
              this.#templateGlobalContext.consoleInfo ( messageText );
           // console.log ( messageText );
           this.#templateFileStack.gotoBottom();
         } // End else if
        
         //----- EXIT
         else if ( templateCommand === 'EXIT' && conditionalCodeStack.isProcessable() )
         { let errno = 1;                            // Default errno if no arguments are provided
           let errText = 'Generic EXIT encountered.'; // Default error text
          // Retrieve the argument text
          if ( templateStatement )
          { const errArgs = templateStatement.getArgumentText()?.trim();
            if ( errArgs )
            { const args = errArgs.split(/\s+/); // Split by spaces
              if (args.length > 0) {
                if (TdlUtils.isNumeric(args[0]))
                { errno = parseInt(args[0], 10); // First argument is errno if numeric
                  errText = TdlUtils.trim(args.slice(2).join(' ')); // Remaining text is the error message
                } // End if
                else 
                { // If the first argument isn't numeric, treat the whole input as the error text
                  errno = 222; // Default errno
                  errText = errArgs;
                } // End else
              } // End if
            } // End if errArgs
          } // End if templateStatement
          // Build location details for the error
          const locationDetails
            = '--*** fileName: "'
              + this.#templateFileStack.getFileName()
              + '"\n--*** LineNumber: '
              + ( this.#templateFileStack.getLineNumber() + 1 );
          // Throw the error with errno and text
          const error = new Error ( ( errText ? errText + '\n' : '') + locationDetails );
          error.errno = errno;
          throw error;
        } // End else if
         //----- IF/IF_N_SET/IF_SET/IF_NOT_SET/IF_DEF/IF_NOT_DEF/ELSE_IF/ELSIF/ELSE/ENDIF
         else if ( LIST_OF_CONDITIONAL_TERMS.includes ( templateCommand ) )
         { lineCounter 
             = conditionalCodeStack.processConditionalStatements
                 ( this.#templateFileStack.getFileContents(), 
                   lineCounter, 
                   templateStatement, 
                   templateCommand
                 );
           lineCounter--;
           currentLineOfText = this.#templateFileStack.setLineNumber ( lineCounter );
         } // End else if IF/ELSEIF/ELSE/ENDIF
              
         //----- INCLUDE
         else if ( templateCommand === 'INCLUDE' && conditionalCodeStack.isProcessable())
         { let fileSpecification = templateStatement.getFileSpecification();
           let newTemplateFile 
                 = new TemplateFile 
                    ( fileSpecification, this.#templateGlobalContext 
                    );
           // if ( ! startsAndEndsWithCaret( fileSpecification ) )
           this.getTemplateFileStack().pushTemplateFile ( newTemplateFile );
           this.#templateGlobalContext.getLocalVariableStack().set
              ( 'currentTemplateFileSpec',  
                templateStatement.getFileSpecification() 
              );
           let numberOfDefinitions 
             = tdlUtils.processCmdLine 
                 ( templateStatement.getArgumentString(),
                   '' 
                );
           if ( startsAndEndsWithCaret( fileSpecification ) )
           { this.getTemplateFileStack().popTemplateFile ( newTemplateFile );
           } // End if
           else
           { this.#templateFileStack.gotoTop();
           } // End else
         } // End if
         
         //----- LOOP
         else if ( templateCommand === 'LOOP' && conditionalCodeStack.isProcessable())
         { let loopName = trim ( templateStatement.getArgumentText() ).split(/\s+/)[0];
           this.#templateGlobalContext.getLocalVariableStack().pushLocalVariablesOnStack();
           let listOfParameters = ''; // loopBlock.gefListOfParameters();
           let numberOfDefinitions 
             = tdlUtils.processCmdLine 
                 ( templateStatement.getArgumentText(), 
                   listOfParameters 
                );
           lineCounter 
             = this.#templateGlobalContext.getLoopStack().addLoopBlock
                 ( loopName, 
                   lineCounter, 
                   this.#templateFileStack.getFileContents(), 
                   this.#templateGlobalContext
                 );
           let loopBlock = this.#templateGlobalContext.getLoopStack();
           if ( loopBlock.moreDataRecords() )
           { let beginLineNumber = loopBlock.getBeginLineNumber();
             let endLineNumber   = loopBlock.getEndLineNumber();
             let originalLoopBlock
               = this.#templateFileStack.getFileContents().slice
                    ( beginLineNumber, endLineNumber );
             loopBlock.setOriginalTableRows ( originalLoopBlock );
           } // End if 
           else
           { loopBlock.popLoopBlock();
             this.#templateGlobalContext.getLocalVariableStack().popLocalVariablesOnStack();
             lineCounter         = loopBlock.getEndLineNumber();
             this.#templateFileStack.setLineNumber ( lineCounter );
             templateStatement   = new TemplateStatement ( lineCounter, this.#templateGlobalContext );
           } // End Else
         } // End if
 
         //----- BREAK
         else if ( templateCommand === 'BREAK' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.getLoopStack().exitTheLoop();
         } // End if
       
         //----- END_LOOP
         else if ( templateCommand === 'END_LOOP' && conditionalCodeStack.isProcessable())
         { let loopStack = this.#templateGlobalContext.getLoopStack();
           if ( loopStack.moreDataRecords() )
           { loopStack.moveToNextRecord();
             let topOfLoopCounter = loopStack.topOfLoop(); 
             let originalBlock = loopStack.getOriginalTableRows();
             let beginLineNumber = this.#templateGlobalContext.getLoopStack().getBeginLineNumber();
             this.#templateFileStack.setSplice ( beginLineNumber, originalBlock );
             currentLineOfText = this.#templateFileStack.setLineNumber ( topOfLoopCounter );
           } // End if
           else
           { loopStack.popLoopBlock();
             this.#templateGlobalContext.getLocalVariableStack().popLocalVariablesOnStack();
           } // End else
         } // End else if END_LOOP
              
         //----- MOVE
         else if ( templateCommand === 'MOVE' )
         { let numberRecords = templateStatement.getArgumentText();
          this.#templateGlobalContext.getLoopStack().moveRecordLocation ( numberRecords  );
         } // End if
         
         //----- OUTPUT
         else if ( templateCommand === 'OUTPUT' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.getTdlUtils().processOutputCommand ( templateStatement );
         } // End if
 
         //----- PUT
         else if ( templateCommand === 'PUT' && conditionalCodeStack.isProcessable())
         { let firstWord = templateStatement.getFirstWord();
           let putText = templateStatement.getArgumentText();
           templateStatement.setLineOfText ( putText );
           currentLineOfText = templateStatement.getLineOfText();
           process.stdout.write ( putText.toString() );
           addNewLine = false;
         } // End if
        
         //----- PUT_LINE
         else if ( templateCommand === 'PUT_LINE' && conditionalCodeStack.isProcessable())
         { let lineOfText = trimLeft ( templateStatement.getLineOfText() ) ;
           let firstWord = templateStatement.getFirstWord();
           let putText = templateStatement.getArgumentText();
           templateStatement.setLineOfText ( putText );
           currentLineOfText = templateStatement.getLineOfText();
           process.stdout.write ( putText.toString() );
           addNewLine = true;
         } // End if

         //----- SET
         else if ( templateCommand === 'SET' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.getTdlUtils().processSettingVariableValues 
            ( templateStatement );
         } // End if
        
         //----- UN_DEFINE
         else if ( templateCommand === 'UN_DEFINE' && conditionalCodeStack.isProcessable())
         { this.#templateGlobalContext.getLocalVariableStack().delete ( templateStatement.getObject() );
           // console.log ( '-- UNDEF ' + templateStatement.getObject() );
         } // End if
        
         //----- UN_SET
         else if ( templateCommand === 'UN_SET' && conditionalCodeStack.isProcessable() )
         { this.#templateGlobalContext.deleteGlobally ( templateStatement.getObject() );
         } // End if
        
         //----- WORDWRAP
         else if ( (templateCommand === 'WORDWRAP' || templateCommand === 'WW') && conditionalCodeStack.isProcessable() )
         { const wordWrap = this.#templateGlobalContext.getWordWrap();
           const argumentList = this.#templateGlobalContext.getArgumentList();
           argumentList.setParameterNames ( wordWrap.getParameterNames () );
           argumentList.setClassInstance ( this.#templateGlobalContext.getWordWrap() );
           argumentList.parseArgumentString ( wordWrap.getParameterNames (), templateStatement.getLineOfText() );
           // const textToWrap = argumentList.getNonArgumentValues()[0][1];
           let textToWrap = argumentList.getNonArgumentValues();
           textToWrap = textToWrap[0];
           if ( textToWrap )
           { textToWrap = textToWrap[1];
             const wordWrapClass = this.#templateGlobalContext.get ( "WwClass" );
             wordWrap.setupFormat ( wordWrapClass );
             argumentList.mergeArgumentValues ( ); // Reset any values assigned values as part of the command
             const wrappedText = wordWrap.process ( textToWrap, currentMetaIndent );
             // Add the contents to the input stack
             let newTemplateFile  = new TemplateFile ( wrappedText, this.#templateGlobalContext );
             currentIndentLevel = wrappedText[0].length - TdlUtils.trimLeft ( wrappedText[0] ).length;
             newTemplateFile.updateFileName ( 'ww:' + wordWrapClass );
             this.getTemplateFileStack().pushTemplateFile ( newTemplateFile );
             this.#templateFileStack.gotoTop();
           } // End if 
         } // End if
       } // End if

       //----- IS NOT A META COMMAND
       if ( ! templateStatement.isMetaCommand() )
       { if ( expandVariables )
         { currentLineOfText        = this.#templateGlobalContext.getTdlUtils().expandVariableNames ( currentLineOfText );
         } // End if
         if ( conditionalCodeStack.isProcessable() )
         { nonMetaIndent            = templateStatement.getIndent();
         } // End if
         if ( lastLineWasMetaCmd )
          { currentMetaIndent = nonMetaIndent;
            lastLineWasMetaCmd = false;
          } // End if
          else
          { currentIndentLevel = Math.max( ( nonMetaIndent - currentMetaIndent) , 0 );
          } // End else
          currentIndentLevel = Math.max( ( currentIndentLevel) , 0 );
          if ( conditionalCodeStack.isProcessable() && metaEchoOutput )
          { conditionalCodeStack.incrementStatementCounter();
            this.#templateGlobalContext.getTdlUtils().processEchoOutput 
              ( lineCounter, 
                templateStatement, 
                currentLineOfText, 
                currentMetaIndent,
                this.getTemplateFileStack().getDepth()
              );
          } // End if
          if ( conditionalCodeStack.isProcessable() && this.#templateGlobalContext.getFileIO().isOutputOpen() )
          { if ( ! ( TdlUtils.isOn ( suppressBlanks ) && (currentLineOfText.trim().length == 0) ) )
            { //let localLineOfText
              //  = this.#templateGlobalContext.getTdlUtils().fixLineIndent 
              //      ( currentLineOfText, 
              //        currentIndentLevel, 
              //        currentMetaIndent 
              //      );
              let localLineOfText = currentLineOfText;
                if ( addNewLine ) 
                { this.#templateGlobalContext.getFileIO().putLineToFile ( localLineOfText );
                } // End if
                else
                { this.#templateGlobalContext.getFileIO().putTextToFile ( localLineOfText );
                  addNewLine = true;
                } // end else
            } // End if
          } // End if
        } // End if

       //----- IS NOT AN UNDEFINED BUT STARTS WITH A META COMMAND INDICATOR
       else if ( templateCommand === 'UNDEFINED' 
                 && currentLineOfText.trim().startsWith (  metaCommandIndicator ) 
               )
       { // Then, we may have a macro that we want to execute.
         let macroName     = templateStatement.getFirstWord().substring ( metaCommentIndicator.length-1 );
         let macroStack    = this.#templateGlobalContext.getMacroStack();
         if (  macroStack.has ( macroName ) )
         { this.#templateGlobalContext.getLocalVariableStack().pushLocalVariablesOnStack();
           let macroBlock        = macroStack.get ( macroName );
           let listOfParameters = macroBlock.gefListOfParameters();
           let numberOfDefinitions 
             = tdlUtils.processCmdLine 
                 ( templateStatement.getArgumentText(), 
                   listOfParameters 
                );
           // this.#templateGlobalContext.dumpGlobalsContext ( 'LOCAL' );
           let newTemplateFile  = new TemplateFile ( macroBlock.getMacroContents(), this.#templateGlobalContext );
           newTemplateFile.updateFileName ( 'macro:' + macroName );
           this.getTemplateFileStack().pushTemplateFile ( newTemplateFile );
           this.#templateFileStack.gotoTop();
         } // end if
         else
         { console.log 
             ( '--*** Warning. Reference to undefined Macro: "' 
               + macroName 
               + '", on line: ' + lineCounter 
               + ' of '+ this.#templateFileStack.getFileName() 
               + ' command skipped.' 
             );
         } // End else
       } // End else 

       this.#templateFileStack.next();
       if ( this.#templateFileStack.isEof() && this.#templateFileStack.getDepth() > 1 )
       { this.#templateFileStack.notifyIsEof();
         this.#templateGlobalContext.getLocalVariableStack().popLocalVariablesOnStack();
         this.#templateFileStack.popTemplateFile();
         this.#templateFileStack.next();
       } // End if

      } // End while
   } // End function unitTestInterpretTemplate
   
} // End class InterpretTemplate

function unitTestInterpretTemplate()
{ console.log ( "--========== starting unitTestInterpretTemplate ==========");
  let templateGlobalContext
    = new TemplateGlobalContext
          ( "_",
            "#",
            process.cwd()
          );
  templateGlobalContext.setReThrowErrors ( true );
  let interpretTemplate = new InterpretTemplate ( templateGlobalContext );
  let inputFileName = "./Templates/HelloWorld.tdl";
  let outputFileName = "./Templates/HelloWorld.txt";
  
     //inputFileName = "./Templates/loopExample.template";
  console.log ( "--========== Starting unitTestInterpretTemplate ==========");
  //try
  { console.log ( "\n--========== Step 1.0 ==========");
    console.log ( '-------' + RULER );
    console.log ( '===== inputFileName: ' + inputFileName );
    templateGlobalContext.getMetaSettings().set( 'metaEchoComment', true );
    interpretTemplate.processTemplate ( inputFileName, outputFileName );
  } // End try block
  // catch ( errorInfo )
  // { console.log   ( '--*** ' + errorInfo );
  //   if ( templateGlobalContext.getReThrowErrors() ) 
  //   { throw errorInfo;
  //   } // End if
  // } // End catch block
  console.log ( "--========== Finishing unitTestInterpretTemplate ==========");
  
} // End function unitTestInterpretTemplate

function main()
{ console.log ( "--========== starting main in Class InterpretTemplate ==========");
  let templateGlobalContext
    = new TemplateGlobalContext();
  console.log ( '##### process.argv             : ' + process.argv );
  console.log ( '##### process.argv.length      : ' + process.argv.length );
  console.log ( '##### process.argv?.[0]        : ' + process.argv?.[0]  );
  console.log ( '##### process.argv?.[1]        : ' + process.argv?.[1]  );
  console.log ( '##### process.argv?.[2]        : ' + process.argv?.[2]  );
  console.log ( '##### process.argv?.[3]        : ' + process.argv?.[3]  );
  console.log ( '##### process.argv?.[4]        : ' + process.argv?.[4]  );
  console.log ( '##### process.argv?.[5]        : ' + process.argv?.[5]  );
  console.log ( '##### process.argv.length      : ' + process.argv.length );
  
  console.log ( '##### process.getArgumentText  : ' + process.getArgumentText );
  console.log ( '##### process.execArgv         : ' + process.execArgv );
  console.log ( '##### process.argv0            : ' + process.argv0 );

  let templateName = process.argv?.[2];
  if ( ! templateName)
  { let errorMessage = '--*** template name is required, none specified';
    console.log ( errorMessage );
    throw errorMessage;
  } // End if
  console.log ('--+++ template name : ' + templateName );
  if ( !FileSystem.existsSync ( templateName ) )
  { let errorMessage = '--*** File: "' + templateName + '" not found or does not exist';
    console.log ( errorMessage );
    throw errorMessage;
  } // End if
  let jsonText = process.argv?.[3];
  let fileExtension = Path.extname ( jsonText );
  let fileName = Path.parse ( jsonText ).name;
  let parsedData;
  if ( jsonText[0] === '{' )
  { parsedData = JSON.parse ( jsonText );
    templateGlobalContext.getLocalVariableStack().setFromJson ( jsonText  );
  } // end if
  if ( jsonText[0] === '[' )
  { templateGlobalContext.getLocalVariableStack().setFromJson ( jsonText  );
  } // End if
  else if (  fileExtension === '.json' )
  { let jasonFileName = jsonText;
    jsonText = templateGlobalContext.getFileIO().synchronouslyReadFile ( jasonFileName, false );
    templateGlobalContext.getLocalVariableStack().setFromJson ( jsonText  );
  } // End else if
  console.log ( '#### companyAddress::firstAddressLine -> ' + templateGlobalContext.get ( 'companyAddress::firstAddressLine' ) );
  console.log ( '#### parsedData ->' + parsedData + '<-' );
} // End function main

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestInterpretTemplate();
  // main();
} // End if
