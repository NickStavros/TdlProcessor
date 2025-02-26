//===== Imports
import MetaCommands                    from "./MetaCommands.js";
import MetaSettings                    from "./MetaSettings.js";
import TemplateGlobalContext           from "./TemplateGlobalContext.js";
import * as TdlUtils                   from './TdlUtils.js';


export default class TemplateStatement
{ //===== Private
  #lineOfText;
  #kindOfText;
  #indent;
  #firstWord;
  #isMetaCommand;
  #metaCommand;
  #argumentText;
  #object;
  #expression;
  #metaIndicator;
  #metaCommandIndicator;
  #templateGlobalContext;

 //===== Constructors 
 constructor ( templateLineOfText, templateGlobalContext )
 { if ( !templateGlobalContext )
   { console.log ( '--*** No TemplateGlobalContext provided to TemplateStatement, creating new local copy.' );
     templateGlobalContext = new TemplateGlobalContext();
   } // End if
   templateGlobalContext.consoleTrace ( 'Starting TemplateStatement Constructor -> ' + templateLineOfText );
   this.#templateGlobalContext = templateGlobalContext;
   if ( ! templateGlobalContext )
   { console.log ( '-- new TemplateGlobalContext defined! ' );
     this.#templateGlobalContext = new TemplateGlobalContext()
   } // end if
   let settings = templateGlobalContext.getMetaSettings();
   this.#metaIndicator = TdlUtils.coalesce ( settings.get ( 'metaIndicator'), '_');
   this.#metaCommandIndicator = TdlUtils.coalesce ( settings.get ( 'metaCommandIndicator'), this.#metaIndicator+'#' );
   // this.#metaIndicator = settings.get ( 'metaIndicator');
   // this.#metaCommandIndicator = settings.get ( 'metaCommandIndicator' );
   this.#metaCommand = 'UNDEFINED';
   this.resetToDefault ( );
   this.setLineOfText ( templateLineOfText )
   templateGlobalContext.consoleTrace ( 'Finishing TemplateStatement Constructor' );
 } // End constructor

 //===== Getters
   getArgumentString()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getArgumentString -> ' + this.#expression );
     return this.#expression;
   } // End function getArgumentString

   getLineOfText ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getLineOfText -> ' + this.#lineOfText );
     return this.#lineOfText;
   } // End function getLineOfText
  
   getKindOfText ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getKindOfText -> ' + this.#kindOfText );
     return this.#kindOfText;
   } // End function getKindOfText
  
   getIndent ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getIndent -> ' + this.#indent );
     return this.#indent;
   } // End function getIndent

   getFileSpecification ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getFileSpecification -> ' + this.#object );
    return this.#object;
  } // End function getIndent
  
   getFirstWord ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getFirstWord -> ' + this.#firstWord );
     return this.#firstWord;
   } // End function getFirstWord
  
   isMetaCommand ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing isMetaCommand -> ' + this.#isMetaCommand );
     return Boolean ( this.#isMetaCommand );
   } // End function isMetaCommand
  
   getObject ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getObject -> ' + this.#object );
     return this.#object;
   } // End function getObject
  
   getArgumentText ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getArgumentText -> ' + this.#argumentText );
     return this.#argumentText;
   } // End function getArgumentText
  
   getExpression ()
   { this.#templateGlobalContext.consoleTrace ( 'Executing getExpression -> ' + this.#expression );
     return this.#expression;
   } // End function getExpression

 //===== Setters
    setLineOfText ( lineOfText )
    { this.#templateGlobalContext.consoleTrace ( 'Starting setLineOfText -> ' + lineOfText );
      this.#expression = undefined;
      let lengthOfLine = ( lineOfText?.length || 0 );
      //this.setLineOfText ( lineOfText );
      if ( lineOfText?.length >= 0  )
      { this.#kindOfText = this.#templateGlobalContext.getMetaCommands().getMetaCommandByValue ( ' ' );
        let trimmedLineOfTextLength = ( lineOfText?.trimStart().length || 0);
        if ( lengthOfLine > trimmedLineOfTextLength )
        { this.#indent = lengthOfLine - trimmedLineOfTextLength;
        } // End if
        this.#lineOfText = lineOfText;
        if ( this.#lineOfText.trim().length > 0 )
        { let parsedText = lineOfText.trim().split( /\s/ );
          if ( parsedText.length > 1 )
          { this.#argumentText = lineOfText.trim().split( parsedText[0] )[1].trimStart();
          } // End if
          else
          { this.#argumentText = undefined;
          } // End else
          this.#firstWord = parsedText[0];
          this.extractCommandText ( this.#firstWord );
          if ( parsedText.length > 1 ) 
          { this.#object = parsedText[1];
          } // End if
          // this.#templateGlobalContext.getMetaCommands().resetToDefault ( this.#metaIndicator, this.#metaCommandIndicator );
          this.#kindOfText = this.#templateGlobalContext.getMetaCommands().getMetaCommandByValue ( this.#metaCommand );
          this.#isMetaCommand = this.textIsMetaCommand ( this.#lineOfText );
          if ( this.#templateGlobalContext.getMetaCommands().hasLogicalExpression(this.#kindOfText[0] ) )
          { this.#expression = this.#argumentText;
          } // End if
          this.#expression = this.#argumentText;
          if ( ! this.#isMetaCommand )
          { this.#expression = this.#lineOfText.trim();
          } // End if
          else if ( parsedText.length > 2 && this.#object?.length > 0 ) 
          { this.#expression = lineOfText.trim().split( this.#object )[1].trimStart();
          } // End else if
        } // End if
        else
        { this.#argumentText = "";
          this.#expression   = "";
          this.#lineOfText   = "";
        }
        this.#templateGlobalContext.consoleTrace ( 'Finishing setLineOfText ->\n' + this.toJSON() );
      } // End if
    } // End block

    extractCommandText ( possibleCommandWord ) 
    { this.#metaCommand = possibleCommandWord;
      if ( typeof possibleCommandWord === 'string' 
           && possibleCommandWord.startsWith ( this.#metaCommandIndicator )
         ) 
      { this.#metaCommand = possibleCommandWord.slice(this.#metaCommandIndicator.length);
      } // End if
      else if ( typeof possibleCommandWord === 'string' 
                && possibleCommandWord.startsWith ( this.#metaIndicator )
              ) 
      { this.#metaCommand = possibleCommandWord.slice(this.#metaIndicator.length);
      } // End if
      return this.#metaCommand; // Return as-is if the prefix doesn't match
    } // End function extractCommandText

    resetToDefault()
    { this.#templateGlobalContext.consoleTrace ( 'Starting resetToDefault' );
      this.#lineOfText;
      this.#kindOfText           = MetaCommands.UNDEFINED;
      this.#indent               = 0;
      this.#firstWord;
      this.#object;
      this.#templateGlobalContext.consoleTrace ( 'Finishing resetToDefault' );
    }

    textIsMetaCommand ( lineOfText ) 
     { this.#templateGlobalContext.consoleTrace ( 'Starting textIsMetaCommand' );
       let localResult = false;
       let trimmedLineOfText = lineOfText.trimStart();
       let metaIndicator = this.#templateGlobalContext.getMetaSettings().get("metaIndicator");
       let metaCommandIndicator = this.#templateGlobalContext.getMetaSettings().get("metaCommandIndicator");
       if ( trimmedLineOfText.substring ( 0, metaCommandIndicator.length)  ===  metaCommandIndicator )
       { localResult = true;
       } // End if
       const firstChar = trimmedLineOfText.substring ( 0, metaIndicator.length );
       const prefixes = ["_{", "_}", "_?", "_:"];
       if ( prefixes.some ( prefix => lineOfText.startsWith ( prefix ) ) ) 
       { localResult = true;
       } // End if
       this.#templateGlobalContext.consoleTrace ( 'Finishing textIsMetaCommand -> ' + localResult );
       return localResult;
     } // End function textIsMetaCommand

    toJSON()
    { this.#templateGlobalContext.consoleTrace ( 'Starting toJSON' );
      let jsonText
        =  "\n{\n"
           + "  \"lineOfText\"     : \"" + this.#lineOfText + "\",\n"
           + "  \"kindOfText\"     : \"" + this.#kindOfText + "\",\n"
           + "  \"indent\"         : \"" + this.#indent + "\"\n"
           + "  \"firstWord\"      : \"" + this.#firstWord + "\"\n"
           + "  \"isMetaCommand\"  : \"" + this.#isMetaCommand + "\"\n"
           + "  \"argumentText\"   : \"" + this.#argumentText + "\",\n"
           + "  \"object\"         : \"" + this.#object + "\",\n"
           + "  \"expression\"     : \"" + this.#expression + "\"\n"
           +"}\n";
      this.#templateGlobalContext.consoleTrace ( 'Finishing toJSON ->\n'  + jsonText );
      return jsonText
    } // End function toJSON
} // End class TemplateStatement

function TestTemplateStatement()
{ console.log ( "\n--==== STEP : 1.0 " );
  console.log ( "-- create a new instance of the metaSettings" );
  let templateGlobalContext = new TemplateGlobalContext();
  templateGlobalContext.setTraceState ( false );
  let templateStatement = new TemplateStatement ("  this is a test  ", templateGlobalContext );
  console.log ( "-- jsonText       : " + templateStatement.toJSON() );
  console.log ( "-- lineOfText       : " + templateStatement.getLineOfText() + '",');
  console.log ( "-- getKindOfText    : " + templateStatement.getKindOfText() );
  console.log ( "-- getIndent        : " + templateStatement.getIndent() );
  console.log ( "\n--==== STEP : 2.0 " );
  templateStatement = new TemplateStatement ("  _#DEFINE MyName Robert W. Stavros  ", templateGlobalContext );
  console.log ( "-- jsonText       : " + templateStatement.toJSON() );
  console.log ( "\n--==== STEP : 2.1 " );
  templateStatement = new TemplateStatement ('  _#IF   3 + 4 < 5 ', templateGlobalContext );
  console.log ( "-- jsonText       : " + templateStatement.toJSON() );
} // End Function TestTemplateStatement

// TestTemplateStatement();