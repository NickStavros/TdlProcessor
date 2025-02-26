/**
 * File: WordWrap.js
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
 * @class WordWrap
 * @description creates a string from an input string that is wrapped at
 * words according to the parameters set at the time of the processing.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from "./TemplateGlobalContext.js";
import { trim,
         trimLeft,
         trimRight,
         isOn,
         isOnOrOff,
         isUsable,
         removeDuplicateWords,
         wordExistsInList
       }                       from './TdlUtils.js';

//===== Constants =====
export const WwMinimumTextLength  = 25;
export const WwMaximumTextLength  = 255;
export const stringAttributeName  = [ "class",  
                                      "prefix",   
                                      "initialPrefix",   
                                      "postfix",  
                                      "finalPostfix",  
                                      "escapeCharacter",  
                                      "textBreak",  
                                      "newLine",  
                                      "hyphenation"  
                                    ];
export const numericAttributeName = [ "lineLength"
                                    ];
export const booleanAttributeName = [ "quoteLiterals",
                                      "padTheOutput",
                                      "hyphenate"
                                    ];
export const parameterNames       = [ ...stringAttributeName, 
                                      ...numericAttributeName,
                                      ...booleanAttributeName,
                                    ];

//===== Class Definition =====
export default class WordWrap
{ #templateGlobalContext;
  #classProfile;
  #escapeCharacter;
  #finalPostfix;
  #hyphenate;
  #hyphenation;
  #initialPrefix;
  #lineLength;
  #padTheOutput;
  #postfix;
  #prefix;
  #quoteLiterals;
  #textBreak;
  #newLine;

  //===== Constructors 
    constructor ( templateGlobalContext )
    { if ( ( !templateGlobalContext ) )
      { console.log ( '--*** No TemplateGlobalContext provided to WordWrap, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if (
      templateGlobalContext.consoleTrace ( 'Starting WordWrap Constructor' );
      this.#templateGlobalContext = templateGlobalContext;
      this.setupForDefault();
      templateGlobalContext.consoleTrace ( 'Finishing WordWrap Constructor' );
    } // End constructor MetaComm&&s

  process ( textToWrap, indent )
  { let finalPostfix             = this.getFinalPostfix   ( );
    let hyphenate                = this.getHyphenate      ( );
    let hyphenation              = this.getHyphenation    ( );
    let initialPrefix            = this.getInitialPrefix  ( );
    let lineLength               = this.getLineLength     ( );
    let padTheOutput             = this.getPadTheOutput   ( );
    let postfix                  = this.getPostfix        ( );
    let prefix                   = this.getPrefix         ( );
    let quoteLiterals            = this.getQuoteLiterals  ( );
    let textBreak                = this.getTextBreak      ( );
    let newLine                  = this.getNewLine        ( );
    let classProfile             = this.getClass          ( );
    let listOfWords              = [ ];
    let word                     = '';
    let wordSeparator            = '';
    let proposedLineOfText       = '';
    let lineOfText               = '';
    let wrappedText              = [ ];
    let wrappedTextCounter       = -1;
    let currentPrefix            = initialPrefix;
    let currentPostfix           = postfix;
    let wordCounter              = 0;

    if ( typeof indent !== 'number' )
    { indent = 0;
    }
    // indent += prefix.length;
    if ( ! textToWrap )
    { wrappedText [ 1 ] = '';
    } // end if
    else
    { textToWrap           = textToWrap.trim();
      let regexString      = /[^\s\n]+|\n/g;
      listOfWords          = textToWrap.match ( regexString );
      lineOfText           = '';
      wordSeparator        = '';
      let numberOfNewLines = 0;

      for ( word of listOfWords )
      { wordCounter++;
        proposedLineOfText = isUsable ( lineOfText ) ? lineOfText + wordSeparator + word : word;
        if ( word.length === 0 )
        { if ( lineOfText.length > lineLength
               && hyphenate
             )
          { numberOfNewLines = 0;
            while ( Length ( lineOfText ) > lineLength )
            { wrappedTextCounter = wrappedTextCounter + 1;
              wrappedText [ wrappedTextCounter  ]
                =  this.#joinLineForOutput
                  ( //'1: ' + 
                    ''.padStart ( indent ) + currentPrefix,
                    this.#padLineForOutput 
                      ( lineOfText.substring ( 1, (lineLength-1) ) + hyphenation,
                        lineLength,
                        padTheOutput
                      ),
                    postfix
                  );
              lineOfText = lineOfText.substring ( lineLength );
            } // End while loop
            wrappedTextCounter = wrappedTextCounter + 1;
            wrappedText [ wrappedTextCounter ]
              =  this.#joinLineForOutput
              (  //'2: ' + 
                ''.padStart ( indent ) + currentPrefix, 
                this.#padLineForOutput 
                  ( lineOfText.substring ( 1, ( lineLength-1 ) ),
                    lineLength,
                    padTheOutput
                  ),
                postfix
              );
          } // End if
          else
          { if ( lineOfText.length > 0 )
            { wrappedTextCounter = wrappedTextCounter + 1;
              wrappedText [ wrappedTextCounter ]
                =  this.#joinLineForOutput
                  ( //'3: ' + 
                    ''.padStart ( indent ) + currentPrefix, 
                    this.#padLineForOutput 
                      ( lineOfText,
                        lineLength,
                        padTheOutput
                      ),
                    postfix
                  );
             } // End if
          } // End if
          lineOfText = '';
          wrappedTextCounter = wrappedTextCounter + 1;
          wrappedText [ wrappedTextCounter ]
            =  this.#joinLineForOutput
              ( //'4: ' + 
                ''.padStart ( indent ) + currentPrefix, 
                this.#padLineForOutput 
                  ( textBreak,
                    lineLength,
                    padTheOutput
                  ), 
                postfix
              );
          wordSeparator = '';
          currentPrefix = prefix;
        }
        else if ( proposedLineOfText.length > lineLength )
        { numberOfNewLines = 0;
          while ( lineOfText.length > lineLength )
          { wrappedTextCounter = wrappedTextCounter + 1;
            wrappedText [ wrappedTextCounter ]
              =  this.#joinLineForOutput
                ( //'5: ' + 
                  ''.padStart ( indent ) + currentPrefix, 
                  this.#padLineForOutput 
                    ( lineOfText.substring ( 1, (lineLength-1) ) + hyphenation,
                      lineLength,
                      padTheOutput
                    ), 
                  postfix
                );
            lineOfText = lineOfText.substring ( lineLength );
          } // End while
          if ( lineOfText.length > 0 )
          { wrappedTextCounter = wrappedTextCounter + 1;
            wrappedText [ wrappedTextCounter ]
              =  this.#joinLineForOutput
                ( // '6: ' + 
                  ''.padStart ( indent ) + currentPrefix, 
                  this.#padLineForOutput 
                    ( lineOfText + wordSeparator,
                      lineLength,
                      padTheOutput
                    ),
                  postfix
                );
          } // End if
          wordSeparator = ' ';
          currentPrefix = prefix;
          lineOfText = word;
        } // Enn else if
        else if ( word === '\n' )
        { numberOfNewLines++;
          if ( numberOfNewLines < 2 )
          { wrappedTextCounter = wrappedTextCounter + 1;
            wrappedText [ wrappedTextCounter ]
              =  this.#joinLineForOutput
                ( //'7: ' + 
                  ''.padStart ( indent ) + currentPrefix, 
                  this.#padLineForOutput 
                    ( lineOfText, //wordSeparator,
                      lineLength,
                      padTheOutput
                    ),
                  postfix
                );
            wrappedTextCounter = wrappedTextCounter + 1;
            wrappedText [ wrappedTextCounter ]
              =  this.#joinLineForOutput
                 ( //'8: ' + 
                   ''.padStart ( indent ) + prefix, 
                   this.#padLineForOutput 
                     ( textBreak,
                       lineLength,
                       padTheOutput
                     ),
                   postfix
                 );
            wrappedText [ wrappedTextCounter ] = wrappedText [ wrappedTextCounter ].replace (/\n/g, newLine );
          } // End if
          wordSeparator = ' ';
          currentPrefix = prefix;
          lineOfText = '';
          proposedLineOfText = '';
        } // End else if
        else
        { numberOfNewLines = 0;
          wordSeparator = ' ';
          lineOfText = proposedLineOfText;
        }
      } // End for loop
      postfix = postfix.trimEnd(',')
      wrappedTextCounter = wrappedTextCounter + 1;
      wrappedText [ wrappedTextCounter ]
        =  this.#joinLineForOutput
          (  //'9: ' + 
            ''.padStart ( indent ) + currentPrefix,
            this.#padLineForOutput 
                  ( lineOfText,
                    lineLength,
                    padTheOutput
                  ),
            trimRight( postfix, ',')
          );
        wrappedTextCounter++;
        wrappedText [ wrappedTextCounter ]
          =  this.#joinLineForOutput
            ( //'A: ' + 
              '', 
              '',
              ''.padStart ( indent ) + finalPostfix
            );
      } // End else
    return wrappedText;
  } // End function process

  #joinLineForOutput ( prefix, lineOfText, postfix )
  { return prefix + lineOfText + postfix;
  } // End Function joinLineForOutput

  #padLineForOutput ( lineOfText, lineLength, padTheOutput )
  { if( padTheOutput )
    { lineOfText = lineOfText.padEnd( lineLength, ' ' );
    } // End if
    return lineOfText;
  } // End function padLineForOutput

  //===== Getters

    getClass ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getClass' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwClass' );
      if ( localResult !== this.#classProfile )
      { this.#classProfile = localResult;
      } // End if
      return localResult;
    } // End function getClass

    getEscapeCharacter ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getEscapeCharacter' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwFinalPostfix' );
      if ( localResult !== this.#escapeCharacter )
      { this.#escapeCharacter = localResult;
      } // End if
      return localResult;
    } // End function getEscapeCharacter

    getFinalPostfix ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getFinalPostfix' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwFinalPostfix' );
      if ( localResult !== this.#finalPostfix )
      { this.#finalPostfix = localResult;
      } // End if
      return localResult;
    } // End function getFinalPostfix


    getHyphenate ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getHyphenate' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwHyphenate' );
      if ( localResult !== this.#hyphenate )
      { this.#hyphenate = localResult;
      } // End if
      return localResult;
    } // End function getHyphenate

    getHyphenation ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getHyphenation' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwHyphenation' );
      if ( localResult !== this.#hyphenation )
      { this.#hyphenation = localResult;
      } // End if
      return localResult;
    } // End function getHyphenation

    getInitialPrefix ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getInitialPrefix' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwInitialPrefix' );
      if ( localResult !== this.#initialPrefix )
      { this.#initialPrefix = localResult;
      } // End if
      return localResult;
    } // End function getInitialPrefix

    getLineLength ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getLineLength' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwLineLength' );
      if ( localResult !== this.#lineLength )
      { this.#lineLength = localResult;
      } // End if
      return localResult;
    } // End function getLineLength

    getPadTheOutput ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getPadTheOutput' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwPadTheOutput' );
      if ( localResult !== this.#padTheOutput )
      { this.#padTheOutput = localResult;
      } // End if
      return localResult;
    } // End function getPadTheOutput

    getParameterNames ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getParameterNames' );
      return parameterNames;
    } // End function getPadTheOutput
    

    getPrefix ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getPrefix' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwPrefix' );
      if ( localResult !== this.#prefix )
      { this.#prefix = localResult;
      } // End if
      return localResult;
    } // End function getPrefix

    getPostfix ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getPostfix' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwPostfix' );
      if ( localResult !== this.#postfix )
      { this.#postfix = localResult;
      } // End if
      return localResult;
    } // End function getPostfix

    getQuoteLiterals ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getQuoteLiterals' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwQuoteLiterals' );
      if ( localResult !== this.#quoteLiterals )
      { this.#quoteLiterals = localResult;
      } // End if
      return localResult;
    } // End function getQuoteLiterals

    getTextBreak ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getTextBreak' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwTextBreak' );
      if ( localResult !== this.#textBreak )
      { this.#textBreak = localResult;
      } // End if
      return localResult;
    } // End function getTextBreak


    getNewLine ()
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.getNewLine' );
      let localResult = this.#templateGlobalContext.getMetaSettings().get ( 'WwNewLine' );
      if ( localResult !== this.#newLine )
      { this.#newLine = localResult;
      } // End if
      return localResult;
    } // End function getNewLine



  //===== Setters
    setClass( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setClass -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#classProfile = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwClass', newValue );
      } // End if
      else
      { console.log ( '--*** classProfile can only be set to a string value' );
      } // end else
    } // End function setClass

    setEscapeCharacter( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setEscapeCharacter -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#escapeCharacter = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwEscapeCharacter', newValue );
      } // End if
      else
      { console.log ( '--*** escapeCharacter can only be set to a string value' );
      } // end else
    } // End function setEscapeCharacter

    setHyphenate ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setHyphenate -> ' + newValue );
      if ( isOnOrOff ( newValue ) )
      { newValue = isOn ( newValue );
      } // End if
      else
      { newValue = false;
      } // End if
      if ( typeof newValue === 'boolean' )
      { this.#hyphenate = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwHyphenate', newValue );
        // this.#templateGlobalContext.getEnvironmentSettings().set ( 'WwHyphenate', newValue );
      } // End if
      else
      { console.log ( '--*** Hyphenate can only be set to a boolean value' );
      } // end else
    } // End function setHyphenate
  
    setHyphenation ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setHyphenation -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#hyphenation = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwHyphenation', newValue );
      } // End if
      else
      { console.log ( '--*** Hyphenation can only be set to a string value' );
      } // end else
    } // End function setHyphenation
  
    setFinalPostfix ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setFinalPostfix -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#finalPostfix = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwFinalPostfix', newValue );
      } // End if
      else
      { console.log ( '--*** FinalPrefix can only be set to a string value' );
      } // end else
    } // End function setFinalPostfix
  
    setInitialPrefix ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setInitialPrefix -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#initialPrefix = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwInitialPrefix', newValue );
      } // End if
      else
      { console.log ( '--*** InitialPrefix can only be set to a string value' );
      } // end else
    } // End function setInitialPrefix
  
    setLineLength ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setLineLength -> ' + newValue );
      newValue = parseInt ( newValue );
      if ( typeof newValue === 'number' && newValue >= WwMinimumTextLength && newValue <= WwMaximumTextLength )
      { this.#lineLength = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwLineLength', newValue );
      } // End if
      else
      { console.log ( '--*** LineLength can only be set to a integer value between ' + WwMinimumTextLength + '..' + WwMaximumTextLength);
      } // end else
    } // End function setPadTheOutput
  
    setPadTheOutput ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setPadTheOutput -> ' + newValue );
      if ( isOnOrOff ( newValue ) )
      { newValue = isOn ( newValue );
      } // End if
      else
      { newValue = false;
      } // End if
      if ( typeof newValue === 'boolean' )
      { this.#padTheOutput = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwPadTheOutput', newValue );
      } // End if
      else
      { console.log ( '--*** PadTheOutput can only be set to a boolean value' );
      } // end else
    } // End function setPadTheOutput
  
    setPostfix ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setPostfix -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#postfix = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwPostfix', newValue );
      } // End if
      else
      { console.log ( '--*** Postfix can only be set to a string value' );
      } // end else
    } // End function setPostfix
  
    setPrefix ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setPrefix -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#prefix = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwPrefix', newValue );
      } // End if
      else
      { console.log ( '--*** Prefix can only be set to a string value' );
      } // end else
    } // End function setPrefix
  
    setQuoteLiterals ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setQuoteLiterals -> ' + newValue );
      if ( isOnOrOff ( newValue ) )
      { newValue = isOn ( newValue );
      } // End if
      else
      { newValue = false;
      } // End if
      if ( typeof newValue === 'boolean' )
      { this.#quoteLiterals = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwQuoteLiterals', newValue );
      } // End if
      else
      { console.log ( '--*** QuoteLiterals can only be set to a boolean value' );
      } // end else
    } // End function setQuoteLiterals
  
    setNewLine ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setNewLine -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#newLine = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwNewLine', newValue );
      } // End if
      else
      { console.log ( '--*** setNewLine can only be set to a string value' );
      } // end else
    } // End function setNewLine

    setTextBreak ( newValue )
    { this.#templateGlobalContext.consoleTrace ( 'Executing WordWrap.setTextBreak -> ' + newValue );
      if ( typeof newValue === 'string' )
      { this.#textBreak = newValue;
        this.#templateGlobalContext.getMetaSettings().set ( 'WwTextBreak', newValue );
      } // End if
      else
      { console.log ( '--*** TextBreak can only be set to a string value' );
      } // end else
    } // End function setTextBreak
    setupFormat ( style )
    { this.#templateGlobalContext.consoleTrace  ( 'Starting WordWrap.setupFormat -> ' + typeof style + ' ' + style );
      let definesValidStyle = true;
      if ( typeof style !== 'string' )
      { style = 'DEFAULT';
      } // End if
      style = style.toUpperCase();
      switch ( style )
      { case 'CPP':
          this.setupForCpp();
          break;
        case 'DEFAULT':
          this.setupForDefault();
          break;
        case 'HTML':
          this.setupForHtml();
          break;
        case 'JAVADOC':
          this.setupForJavaDoc();
          break;
        case 'DOCBODY':
          this.setupForDocBody();
          break;
        case 'SQL':
          this.setupForSql()
          break;
        case 'ENVIRONMENT':
          this.resetFromEnvVars();
          break;
        default:
          definesValidStyle = false;
          this.setupForDefault();
      } // End switch

      this.#templateGlobalContext.consoleTrace ( 'Finishing WordWrap.setupFormat ->\n' + this.toJSON() );
      return definesValidStyle;
    } // End function setupFormat

    resetFromEnvVars()
    { this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.resetFromEnvVars' );
      let envSettings          = this.#templateGlobalContext.getEnvironmentSettings();
      this.#classProfile       = envSettings.get ( 'WwPlainText' );
      this.#finalPostfix       = envSettings.get ( 'WwFinalPostfix' );
      this.#hyphenate          = envSettings.get ( 'WwHyphenate' );
      this.#hyphenation        = envSettings.get ( 'WwHyphenation' );
      this.#initialPrefix      = envSettings.get ( 'WwInitialPrefix' );
      this.#lineLength         = envSettings.get ( 'WwLineLength' );
      this.#padTheOutput       = envSettings.get ( 'WwPadTheOutput' );
      this.#postfix            = envSettings.get ( 'WwPostfix' );
      this.#prefix             = envSettings.get ( 'WwPrefix' );
      this.#quoteLiterals      = envSettings.get ( 'WwQuoteLiterals' );
      this.#textBreak          = envSettings.get ( 'WwTextBreak' );
      this.#newLine            = envSettings.get ( 'WwNewLine' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.resetFromEnvVars' );
    } // End function setupFromEnvVars

    setupForDefault()
    { this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.setupForDefault' );
      this.#classProfile       = this.setClass          ( 'PlainText' );
      this.#finalPostfix       = this.setFinalPostfix   ( '' );
      this.#hyphenate          = this.setHyphenate      ( false );
      this.#hyphenation        = this.setHyphenation    ( '-' );
      this.#initialPrefix      = this.setInitialPrefix  ( ' ' );
      this.#lineLength         = this.setLineLength     ( 65 );
      this.#padTheOutput       = this.setPadTheOutput   ( false );
      this.#postfix            = this.setPostfix        ( ' ' );
      this.#prefix             = this.setPrefix         ( ' ' );
      this.#quoteLiterals      = this.setQuoteLiterals  ( false );
      this.#textBreak          = this.setTextBreak      ( ' ' );
      this.#newLine            = this.setNewLine        ( '\n' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.setupForDefault' );
    } // End setupForDefault

    setupForCpp()
    { this.setupForDefault();
      this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.setupForCpp' );
      this.#classProfile       = this.setClass          ( 'cpp' );
      this.#finalPostfix       = this.setFinalPostfix   ( ';\n' );
      this.#hyphenate          = this.setHyphenate      ( false );
      this.#hyphenation        = this.setHyphenation    ( '-' );
      this.#initialPrefix      = this.setInitialPrefix  ( '"' );
      this.#lineLength         = this.setLineLength     ( 50 );
      this.#padTheOutput       = this.setPadTheOutput   ( true );
      this.#postfix            = this.setPostfix        ( '"' );
      this.#prefix             = this.setPrefix         ( '+ "' );
      this.#quoteLiterals      = this.setQuoteLiterals  ( true );
      this.#textBreak          = this.setTextBreak      ( '\n' );
      this.#newLine            = this.setNewLine        ( '\\n' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.setupForCpp' );
    } // End setupForCpp

    setupForHtml()
    { this.setupForDefault();
      this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.setupForHtml' );
      this.#classProfile       = this.setClass          ( 'html' );
      this.#finalPostfix       = this.setFinalPostfix   ( '</p>\n' );
      this.#hyphenate          = this.setHyphenate      ( false );
      this.#hyphenation        = this.setHyphenation    ( '-' );
      this.#initialPrefix      = this.setInitialPrefix  ( '<p>\n' );
      this.#lineLength         = this.setLineLength     ( 70 );
      this.#padTheOutput       = this.setPadTheOutput   ( false );
      this.#postfix            = this.setPostfix        ( '' );
      this.#prefix             = this.setPrefix         ( '' );
      this.#quoteLiterals      = this.setQuoteLiterals  ( true );
      this.#textBreak          = this.setTextBreak      ( '</p>\n<p>' );
      this.#newLine            = this.setNewLine        ( '\n' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.setupForHtml' );
    } // End setupForHtml

    setupForJavaDoc()
    { this.setupForDefault();
      this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.setupForHtml' );
      this.#classProfile       = this.setClass          ( 'JavaDoc' );
      this.#finalPostfix       = this.setFinalPostfix   ( ' **/ ' );
      this.#hyphenate          = this.setHyphenate      ( false );
      this.#hyphenation        = this.setHyphenation    ( '-' );
      this.#initialPrefix      = this.setInitialPrefix  ( '/** ' );
      this.#lineLength         = this.setLineLength     ( 65 );
      this.#padTheOutput       = this.setPadTheOutput   ( false );
      this.#postfix            = this.setPostfix        ( '' );
      this.#prefix             = this.setPrefix         ( ' *  ' );
      this.#quoteLiterals      = this.setQuoteLiterals  ( true );
      this.#textBreak          = this.setTextBreak      ( '' );
      this.#newLine            = this.setNewLine        ( '\n' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.setupForHtml' );
    } // End setupForJavaDoc

    setupForDocBody()
    { this.setupForDefault();
      this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.setupForHtml' );
      this.#classProfile       = this.setClass          ( 'JavaDoc' );
      this.#finalPostfix       = this.setFinalPostfix   ( ' * ' );
      this.#hyphenate          = this.setHyphenate      ( false );
      this.#hyphenation        = this.setHyphenation    ( '-' );
      this.#initialPrefix      = this.setInitialPrefix  ( ' * ' );
      this.#lineLength         = this.setLineLength     ( 65 );
      this.#padTheOutput       = this.setPadTheOutput   ( false );
      this.#postfix            = this.setPostfix        ( '' );
      this.#prefix             = this.setPrefix         ( ' *  ' );
      this.#quoteLiterals      = this.setQuoteLiterals  ( true );
      this.#textBreak          = this.setTextBreak      ( '' );
      this.#newLine            = this.setNewLine        ( '\n' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.setupForHtml' );
    } // End setupForDocBody

    setupForSql()
    { this.setupForDefault();
      this.#templateGlobalContext.consoleTrace ( 'Starting WordWrap.setupForHtml' );
      this.#classProfile       = this.setClass          ( 'SQL' );
      this.#finalPostfix       = this.setFinalPostfix   ( ';' );
      this.#hyphenate          = this.setHyphenate      ( false );
      this.#hyphenation        = this.setHyphenation    ( '-' );
      this.#initialPrefix      = this.setInitialPrefix  ( '\'' );
      this.#lineLength         = this.setLineLength     ( 70 );
      this.#padTheOutput       = this.setPadTheOutput   ( false );
      this.#postfix            = this.setPostfix        ( '\'' );
      this.#prefix             = this.setPrefix         ( '|| \'' );
      this.#quoteLiterals      = this.setQuoteLiterals  ( true );
      this.#textBreak          = this.setTextBreak      ( '\n' );
      this.#newLine            = this.setNewLine        ( '\\n' );
      this.#templateGlobalContext.consoleTrace ( 'finishing WordWrap.setupForHtml' );
    } // End setupForSql

    toJSON()
    { let jsonText = '';
      jsonText += '{\n';
      jsonText += '  "class"           :  " ' + this.getClass          () + '",\n';
      jsonText += '  "finalPostfix"    :  " ' + this.getFinalPostfix   () + '",\n';
      jsonText += '  "hyphenate"       :  " ' + this.getHyphenate      () + '",\n';
      jsonText += '  "hyphenation"     :  " ' + this.getHyphenation    () + '",\n';
      jsonText += '  "initialPrefix"   :  " ' + this.getInitialPrefix  () + '",\n';
      jsonText += '  "lineLength"      :  " ' + this.getLineLength     () + '",\n';
      jsonText += '  "padTheOutput"    :  " ' + this.getPadTheOutput   () + '",\n';
      jsonText += '  "prefix"          :  " ' + this.getPrefix         () + '",\n';
      jsonText += '  "postfix"         :  " ' + this.getPostfix        () + '",\n';
      jsonText += '  "quoteLiterals"   :  " ' + this.getQuoteLiterals  () + '",\n';
      jsonText += '  "newLine"         :  " ' + this.getNewLine        () + '",\n';
      jsonText += '  "textBreak"       :  " ' + this.getTextBreak      () + '",\n';
      jsonText += '}\n';
      return jsonText;
    } // End function toJSON

    logToConsole ( wordWrappedText )
    { let lineCounter = -1;
      for ( let lineOfText of wordWrappedText )
      { lineCounter++;
        console.log ( '-- ' + lineCounter + '] -> ' + lineOfText );  
      }  // End for
    } // End function logToConsole

} // End class WordWrap

function unitTestWordWrap()
{ let templateGlobalContext = new TemplateGlobalContext();
  templateGlobalContext.setTraceState ( false );
  let wordWrap              = new WordWrap ( templateGlobalContext );
  templateGlobalContext.setTraceState ( false );

  let prefix               = '*   ';
  let initialPrefix        = '/** ';
  let postfix              = '';
  let finalPostfix         = '**/';
  let escapeCharacter      = '\'';
  let lineLength           = 65;
  let quoteLiterals        = false;
  let padTheOutput         = false;
  let hyphenate            = true;
  let textBreak            = '';
  let newLine              = '\n';
  let hyphenation          = '-';
  let wrappedText          = [ ];
  let wrappedTextCounter   = 0;

  templateGlobalContext.setTraceState ( false );


  let textToWrap           =
`We endured a numbing complicity between government and opposition. The door out of Europe was held open by ''Corbyn for Johnson'' to walk through. In this case, if you traveled far enough to the left, you met and "embraced the right coming the other way".

VeryLongWordVeryLongWordVeryLongWordVeryLongWordVeryLongWord

Start with a short VeryLongWordVeryLongWordVeryLongWordVeryLongWordVeryLongWord

VeryLongWordVeryLongWordVeryLongWordVeryLongWordVeryLongWord End with a Short

What did we learn in our blindness? That those not flourishing within the status quo had no good reason to vote for it; that our prolonged parliamentary chaos derived from an ill-posed yes-no question to which there were a score of answers; that the long-evolved ecology of the EU has profoundly shaped the flora of our nation’s landscape and to rip these plants out will be brutal; that what was once called a hard Brexit became soft by contrast with the threatened no-deal that even now persists; that any mode of departure, by the government’s own estimate, will shrink the economy; that we have a gift for multiple and bitter division – young against old, cities against the country, graduates against early school-leavers, Scotland and Northern Ireland against England and Wales; that all past, present and future international trade deals or treaties are a compromise with sovereignty, as is our signature on the Paris accords, or our membership of Nato, and that therefore “Take Back Control” was the emptiest, most cynical promise of this sorry season.

We surprised ourselves. Only a few years ago, asked to list the nation’s ills – wealth gap, ailing NHS, north-south imbalance, crime, terrorism, austerity, housing crisis etc – most of us would not have thought to include our membership of the EU. How happy we were in 2012, in the afterglow of our successful Olympics. We weren’t thinking then of Brussels. It was, in Guy Verhofstadt’s famous term, a “cat-fight” within the Tory party that got us going. Those cats had been fighting each other for decades. When they dragged us in and urged us to take sides, we had a collective nervous breakdown; then sufficient numbers wanted the distress to go away and “get Brexit done”. Repeated ad nauseam by the prime minister it almost seemed impolite to ask why.`;

let localResult;
  templateGlobalContext.setTraceState ( false );
  console.log ( '\n\n ======== testMetaCommands ==========' );
    console.log ( "\n--==== STEP : 0.0 WordWrap.process DEFAULT" );
    // console.log ( '-- textToWrap ->\n' + textToWrap );

    console.log ( "\n--==== STEP : 1.0 WordWrap.process DEFAULT" );
    console.log ( '-- WordWrap DEFAULT params->\n' + wordWrap.toJSON() );
    localResult = wordWrap.process ( textToWrap, 0 );
    console.log ( '-- LocalResult.length ->' + localResult.length );
    wordWrap.logToConsole ( localResult );
    
    console.log ( "\n--==== STEP : 2.0 WordWrap.process CPP" );
    templateGlobalContext.setTraceState ( false );
    wordWrap.setupForCpp ();
    console.log ( '-- WordWrap params CPP->\n' + wordWrap.toJSON() );
    localResult = wordWrap.process ( textToWrap, 10 );
    wordWrap.logToConsole ( localResult );

    console.log ( "\n--==== STEP : 3.0 WordWrap.process HTML" );
    templateGlobalContext.setTraceState ( false );
    wordWrap.setupForHtml ();
    console.log ( '-- WordWrap params HTML ->\n' + wordWrap.toJSON() );
    localResult = wordWrap.process ( textToWrap, 0 );
    wordWrap.logToConsole ( localResult );
    
    console.log ( "\n--==== STEP : 4.1 WordWrap.process CPP" );
    templateGlobalContext.setTraceState ( false );
    wordWrap.setupFormat ( 'CPP' );
    templateGlobalContext.setTraceState ( false );
    console.log ( '-- WordWrap params->\n' + wordWrap.toJSON() );
    localResult = wordWrap.process ( textToWrap, 0 );
    wordWrap.logToConsole ( localResult );

    console.log ( "\n--==== STEP : 4.2 WordWrap.process html" );
    templateGlobalContext.setTraceState ( false );
    wordWrap.setupFormat ( 'html' );
    templateGlobalContext.setTraceState ( false );
    console.log ( '-- WordWrap params->\n' + wordWrap.toJSON() );
    localResult = wordWrap.process ( textToWrap, 0 );
    wordWrap.logToConsole ( localResult );

    console.log ( "\n--==== STEP : 4.3 WordWrap.process html" );
    templateGlobalContext.setTraceState ( false );
    wordWrap.setupFormat ( 'SQL' );
    templateGlobalContext.setTraceState ( false );
    console.log ( '-- WordWrap params->\n' + wordWrap.toJSON() );
    localResult = wordWrap.process ( textToWrap, 0 );
    wordWrap.logToConsole ( localResult );

    // console.log ( '-- LocalResult ->\n' + localResult );

} // End function unitTestWordWrap

if (import.meta.url === 'file://'+process.argv[1]) 
{ unitTestWordWrap();
} // End if