/**
 * File: GlobalSettings.js
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
 * @class GlobalSettings
 * @description Defines some Global Settings
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */
//===== Imports =====
import TemplateGlobalContext from "./TemplateGlobalContext.js";

//===== Class Definition ======
export default class GlobalSettings
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #metaSettings;
  //===== Constructors 
    constructor ( templateGlobalContext  )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to GlobalSettings, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      this.#templateGlobalContext = templateGlobalContext;
      this.#templateGlobalContext.consoleTrace ( 'Starting GlobalSettings Constructor' );
      this.#templateGlobalContext = templateGlobalContext;
      this.#metaSettings          = this.#templateGlobalContext.getMetaSettings();
      this.defineGlobalConstants();
      this.definePlatforms();
      this.defineOsArchitectures();
      this.defineMathOperators();
      this.defineDataTypeNames();
      this.definePunctuation();
      this.#templateGlobalContext.consoleTrace (  'Finishing GlobalSettings Constructor' );
    } // End constructor 
  /**
   * Sets up global constants by populating metaSettings with predefined values.
   */
  defineGlobalConstants()
  { this.#templateGlobalContext.consoleTrace ( ' Starting GlobalSettings.defineGlobalConstants' );
    this.#metaSettings.set('ampersand'            , '&');
    this.#metaSettings.set('apostrophe'           , "'");
    this.#metaSettings.set('asterisk'             , '*');
    this.#metaSettings.set('atSign'               , '@');
    this.#metaSettings.set('backSlash'            , '\\');
    this.#metaSettings.set('caretChar'            , '^');
    this.#metaSettings.set('colon'                , ':');
    this.#metaSettings.set('comma'                , ',');
    this.#metaSettings.set('dollarSign'           , '$');
    this.#metaSettings.set('equalSign'            , '=');
    this.#metaSettings.set('exclamationMark'      , '!');
    this.#metaSettings.set('formFeedCharacter'    , '\f');
    this.#metaSettings.set('graveCharacter'       , '`');
    this.#metaSettings.set('GreaterThanCharacter' , '>');
    this.#metaSettings.set('hyphen'               , '-');
    this.#metaSettings.set('leftBrace'            , '{');
    this.#metaSettings.set('leftParentheses'      , '(');
    this.#metaSettings.set('leftSquareBracket'    , '[');
    this.#metaSettings.set('lessThanCharacter'    , '<');
    this.#metaSettings.set('newLineCharacter'     , '\n');
    this.#metaSettings.set('numberSign'           , '#');
    this.#metaSettings.set('percentSign'          , '%');
    this.#metaSettings.set('period'               , '.');
    this.#metaSettings.set('plusSign'             , '+');
    this.#metaSettings.set('questionMark'         , '?');
    this.#metaSettings.set('quote'                , '"');
    this.#metaSettings.set('requiredBlank'        , ' ');
    this.#metaSettings.set('returnCharacter'      , '\r');
    this.#metaSettings.set('rightBrace'           , '}');
    this.#metaSettings.set('rightParentheses'     , ')');
    this.#metaSettings.set('rightSquareBracket'   , ']');
    this.#metaSettings.set('semicolon'            , ';');
    this.#metaSettings.set('slash'                , '/');
    this.#metaSettings.set('spaceCharacter'       , ' ');
    this.#metaSettings.set('tabCharacter'         , '\t');
    this.#metaSettings.set('tildeCharacter'       , '~');
    this.#metaSettings.set('underscoreCharacter'  , '_');
    this.#metaSettings.set('verticalBar'          , '|');
    this.#metaSettings.set('verticalTab'          , '\v');
    this.#metaSettings.set('dot'                  , this.#metaSettings.get ( 'period' ) );
    this.#metaSettings.set('hashSign'             , this.#metaSettings.get ( 'numberSign' ) );
    this.#metaSettings.set('minusSign'            , this.#metaSettings.get ( 'hyphen' ) );
    this.#metaSettings.set('poundSign'            , this.#metaSettings.get ( 'numberSign' ) );
    this.#templateGlobalContext.consoleTrace ( ' Finishing GlobalSettings.defineGlobalConstants' );
  } // End function defineGlobalConstants

   /**
   * Defines supported platforms and stores them in metaSettings.
   */
   definePlatforms() {
    this.#templateGlobalContext.consoleTrace(' Starting GlobalSettings.definePlatforms');
    let listOfPlatforms = "win32,darwin,linux,aix,freebsd,openbsd,sunos,android,ios";
    this.#metaSettings.set('listOfPlatforms', listOfPlatforms);
    this.#templateGlobalContext.consoleTrace(' Finishing GlobalSettings.definePlatforms');
  } // End function definePlatforms

  /**
   * Defines supported OS architectures and stores them in metaSettings.
   */
  defineOsArchitectures() {
    this.#templateGlobalContext.consoleTrace(' Starting GlobalSettings.defineOsArchitectures');
    let listOfArchitectures = "x64,arm,arm64,ia32,mips,mipsel,ppc,ppc64,x86,x86_64";
    this.#metaSettings.set('osArchitectures', listOfArchitectures);
    this.#templateGlobalContext.consoleTrace(' Finishing GlobalSettings.defineOsArchitectures');
  } // End function defineOsArchitectures

  /**
   * Defines data type names and stores them in metaSettings.
   */
  defineDataTypeNames() {
    this.#templateGlobalContext.consoleTrace(' Starting GlobalSettings.defineDataTypeNames');
    let listOfDataTypeNames = "boolean,character,decOctetValue,floatingPoint,hexCharacter,hexaDecimalDigit,hexaDecimalValue,numeric,integer,string";
    this.#metaSettings.set('dataTypeNames', listOfDataTypeNames);
    this.#templateGlobalContext.consoleTrace(' Finishing GlobalSettings.defineDataTypeNames');
  } // End function defineDataTypeNames

  /**
   * Defines punctuation characters and stores them in metaSettings.
   */
  definePunctuation() {
    this.#templateGlobalContext.consoleTrace(' Starting GlobalSettings.definePunctuation');
    let listOfPunctuation = "period,comma,colon,semicolon,questionMark,exclamationMark,<literalCharacter>,<parenthesesSet>,<squareBracketSet>,<braceSet>";
    this.#metaSettings.set('punctuation', listOfPunctuation);
    this.#templateGlobalContext.consoleTrace(' Finishing GlobalSettings.definePunctuation');
  } // End function definePunctuation

  /**
   * Defines mathematical operators and stores them in metaSettings.
   */
  defineMathOperators() {
    this.#templateGlobalContext.consoleTrace(' Starting GlobalSettings.defineMathOperators');
    let listOfMathOperators 
      = "<binaryMathOperator>,<unaryMathOperator>,<comparisonOperator>";
    let listOfBinaryMathOperators
      = "additionOperator,subtractOperator,multiplyOperator,divideOperator,powerOperator,moduloOperator";
    let listOfUnaryMathOperators
      = "negativeSign,positiveSign,logicalNot";
    let listOfComparisonOperators 
      = "equalTo,notEqualTo,lessThanOperator,greaterThanOperator,<lessThanEqualOperator>,<greaterThanEqualOperator>";
    this.#metaSettings.set ( 'mathOperators'        , listOfMathOperators);
    this.#metaSettings.set ( 'binaryMathOperators'  , listOfBinaryMathOperators);
    this.#metaSettings.set ( 'unaryMathOperators'   , listOfUnaryMathOperators);
    this.#metaSettings.set ( 'comparisonOperators'  , listOfComparisonOperators);
    this.#metaSettings.set ( 'additionOperator'     , '+');
    this.#metaSettings.set ( 'subtractOperator'     , '-');
    this.#metaSettings.set ( 'multiplyOperator'     , '*');
    this.#metaSettings.set ( 'divideOperator'       , '/');
    this.#metaSettings.set ( 'powerOperator'        , '^');
    this.#metaSettings.set ( 'moduloOperator'       , '%');
    this.#metaSettings.set ( 'negativeSign'         , '-');
    this.#metaSettings.set ( 'positiveSign'         , '+');
    this.#metaSettings.set ( 'logicalNot'           , '!');
    this.#metaSettings.set ( 'equalTo'              , '==');
    this.#metaSettings.set ( 'notEqualTo'           , '!=');
    this.#metaSettings.set ( 'notEqualToSql'        , '<>');
    this.#metaSettings.set ( 'assignmentOperator'   , '=');
    this.#metaSettings.set ( 'lessThanOperator'     , '<');
    this.#metaSettings.set ( 'greaterThanOperator'  , '>');
    this.#metaSettings.set ( 'logicalAnd'           , '&');
    this.#metaSettings.set ( 'logicalOr'            , '|');
    this.#templateGlobalContext.consoleTrace(' Finishing GlobalSettings.defineMathOperators');
  } // End function defineMathOperators

} // End class GlobalSettings