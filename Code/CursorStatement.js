/**
 * File: CursorStatement.js
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
 * @class CursorStatement
 * @description parses and captures the components of a cursor command.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Import =====
import TemplateGlobalContext from './TemplateGlobalContext.js';
import TemplateStatement     from './TemplateStatement.js';
import TdlUtils, { doesFileExist, toValidNameChars }  from './TdlUtils.js';
import path                  from 'path';

//===== Class Definition =====
export default class CursorStatement
{ //===== Private
    /**
     * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
     * @type { TemplateGlobalContext }
     * @private
     */
    #templateGlobalContext;
    #nameOfCursor;
    #typeOfCursor;
    #cursorStatement;
    #attributeDesc;
    #attributeStack;
    #queryComponent;
    #inlineMemoryData;
    #rawMemoryData;
    #fromFileSpec;
    #typeOfCursorList  = [ 'MEMORY', 'JSON', 'CSV', 'SQL', 'XML', 'XMI', 'RDF' ];
    #sqlKeyWord        = [ 'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'JOIN', 'ON' ];
    #sqlWhereOperators = [ 'AND', 'OR', 'NOT' ];

  //===== Constructors 
    constructor ( templateGlobalContext  )
    { if ( !templateGlobalContext )
      { console.log ( '--*** No TemplateGlobalContext provided to CursorStatement, creating new local copy.' );
        templateGlobalContext = new TemplateGlobalContext();
      } // End if
      this.#templateGlobalContext = templateGlobalContext;
      this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement Constructor' );
      this.#templateGlobalContext = templateGlobalContext;
      this.#reset();
      this.#templateGlobalContext.consoleTrace (  'Finishing CursorStatement Constructor' );
    } // End constructor
    #reset()
    { this.#fromFileSpec          = null;
      this.#attributeDesc         = [];
      this.#attributeStack        = [];
      this.#queryComponent        = new Map();
    } // End function reset

  //===== Getters
    getQueryComponents()
    { this.#templateGlobalContext.consoleTrace ( 'Executing CursorStatement.getQueryComponents' );
      return this.#queryComponent;
    } // End function getSelectComponents

    getComponent ( componentName )
    { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.getComponent -> ' + componentName );
      let localResult;
      if ( !componentName || ( !this.#sqlKeyWord.includes ( componentName.trim().toUpperCase() ) ) )
      { let errorMessage = '--*** Unknown componentName, "' + componentName + '". Known component names are: "' + this.#sqlKeyWord + '", returning all components';
        console.log ( errorMessage );
        localResult = this.getQueryComponents();
      } // End if
      else if ( this.#queryComponent && this.#queryComponent instanceof Map )
      { localResult = this.#queryComponent.get ( componentName.trim().toUpperCase() );
      } // End if 
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.getComponent -> ' + JSON.stringify ( localResult ) );
      return localResult;
    } // End function getSelectComponents

    getSelectComponents()
    { this.#templateGlobalContext.consoleTrace ( 'Executing CursorStatement.getSelectComponents' );
      return this.getComponent ( 'SELECT' );
    } // End function getSelectComponents

    getFromComponents()
    { this.#templateGlobalContext.consoleTrace ( 'Executing CursorStatement.getFromComponents' );
      return this.getComponent ( 'FROM' );
    } // End function getFromComponents

    getWhereComponents()
    { this.#templateGlobalContext.consoleTrace ( 'Executing CursorStatement.getWhereComponents' );
      return this.getComponent ( 'WHERE' );
    } // End function getWhereComponents

    getOrderByComponents()
    { this.#templateGlobalContext.consoleTrace ( 'Executing CursorStatement.getOrderByComponents' );
      return this.getComponent ( 'ORDER' );
    } // End function getOrderByComponents

    getTypeOfCursor()
    { this.#templateGlobalContext.consoleTrace ( 'Executing CursorStatement.getFromComponents' );
      return this.#typeOfCursor;
    } // End function getTypeOfCursor

    /**
 * Determines whether the MEMORY-based source is a LIST or JSON.
 * @returns {string} 'LIST' if the source is a list, 'JSON' if the source is JSON, or an empty string if unknown.
 */
/**
 * Determines whether the MEMORY-based source is a LIST or JSON.
 * @returns {string} 'LIST' if the source is a list, 'JSON' if the source is JSON, or an empty string if unknown.
 */
getMemorySourceType() 
{ 
  this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.getMemorySourceType' );

  // Correctly check if "FROM" exists in the Map
  if ( !this.#queryComponent || !this.#queryComponent.has('FROM') ) { 
    console.log ( "--*** No FROM clause found for MEMORY cursor." );
    return '';
  } // End if

  let fromClause = this.#queryComponent.get('FROM');  // Retrieve FROM clause

  if ( Array.isArray(fromClause) && fromClause.length > 0 ) { 
    let firstComponent = fromClause[0].trim();

    // If the first component is '{', we need to determine type dynamically
    if ( firstComponent === '{' ) { 
      let contents = fromClause.slice(1, -1).join(' ').trim(); // Remove { and } and join
      
      if ( contents.includes(':') || contents.match(/"\s*\w+\s*"/) ) { 
        return 'JSON';  // JSON detected if key-value structure exists
      } // End if
      else { 
        return 'LIST';  // Otherwise, assume it's a LIST
      } // End else
    } // End if

    // Standard LIST or JSON cases
    if ( firstComponent.toUpperCase() === 'LIST' ) { 
      return 'LIST';
    } // End if
    else if ( firstComponent.toUpperCase() === 'JSON' ) { 
      return 'JSON';
    } // End else if
    else { 
      console.log ( "--*** Unrecognized MEMORY source type: " + firstComponent );
      return '';
    } // End else
  } // End if

  return ''; // Default case
} // End function getMemorySourceType

getRawMemoryData() 
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.getRawMemoryData' );
  let localResult = '';
  if ( !this.#rawMemoryData ) 
  { console.log ( "--*** No raw MEMORY data found." );
  } // End if
  else
  { this.#templateGlobalContext.consoleTrace 
      ( 'Finishing CursorStatement.getRawMemoryData -> ' 
        + this.#rawMemoryData 
      );
    localResult = this.#rawMemoryData;
    } // End else
  return localResult;
} // End function getRawMemoryData

getInlineList() 
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.getInlineList' );

  let listItems = [];

  if ( !this.#queryComponent || !this.#queryComponent.has('FROM') ) 
  { console.log ( "--*** No FROM clause found for MEMORY cursor." );
    return listItems; 
  } // End if

  let fromClause = this.#queryComponent.get('FROM');

  if ( Array.isArray(fromClause) && fromClause.length > 2 ) 
  { let contents = fromClause.slice(1, -1).join(' ').trim();  // Remove `{}`

    listItems = contents.split(',').map( item => item.trim() ); // Split and trim

    this.#templateGlobalContext.consoleTrace ( 'Extracted LIST: ' + JSON.stringify(listItems) );
  } // End if
  else 
  { console.log ( "--*** Invalid LIST format in MEMORY cursor." ); 
  } // End else

  this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.getInlineList' );
  return listItems;
} // End function getInlineList

getInlineJson() 
{ this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.getInlineJson' );

  let jsonObject = {};

  if ( !this.#queryComponent || !this.#queryComponent.has('FROM') ) 
  { console.log ( "--*** No FROM clause found for MEMORY cursor." );
    return jsonObject; 
  } // End if

  let fromClause = this.#queryComponent.get('FROM');

  if ( Array.isArray(fromClause) && fromClause.length > 2 ) 
  { let jsonText = fromClause.slice(1, -1).join(' ').trim();  // Remove `{}`

    try 
    { jsonObject = JSON.parse(jsonText);
      this.#templateGlobalContext.consoleTrace ( 'Extracted JSON: ' + JSON.stringify(jsonObject) );
    } // End try
    catch ( error ) 
    { console.log ( "--*** Invalid JSON format in MEMORY cursor: " + error.message ); 
    } // End catch
  } // End if
  else 
  { console.log ( "--*** Invalid JSON format in MEMORY cursor." ); 
  } // End else

  this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.getInlineJson' );
  return jsonObject;
} // End function getInlineJson



  //===== Utilities

  parseCursorStatement ( cursorStatement )
  { this.#templateGlobalContext.consoleTrace 
    ( 'Starting CursorStatement.parseCursorStatement ->\n' 
      + cursorStatement 
    );
    this.setCursorStatement ( cursorStatement );
    let metaCommandIndicator = this.#templateGlobalContext.get ( 'metaCommandIndicator' );
    cursorStatement = cursorStatement.replace( /\n/g, ' \n ' );
    let selectRegex = new RegExp( /[A-Za-z_.]+\(.*?\)+|\(.*?\)+|"(?:[^"]|\"|"")*"+|'[^'](?:|\'|'')*'+|`(:    [^`]|``)*`+|[^ ,]+|,/gm );
    let statementParts = cursorStatement.match ( selectRegex );
    let templateCmd = statementParts[0].toUpperCase().replace ( metaCommandIndicator, '' ).trim();
    if ( templateCmd !== 'CURSOR' ) 
    { let errorMessage 
        = '--*** CURSOR statement must start with the word CURSOR. Found: ' 
          + templateCmd
          +   ' is a poorly formed statement ignored.';
      console.log ( errorMessage );
      return false;
    } // End if
    // Strip off leading NAME TYPE
    statementParts.shift();
    this.setNameOfCursor ( statementParts[0] );
    statementParts.shift();
    this.setTypeOfCursor ( statementParts[0] );
    statementParts.shift();
    let currentToken = '';
    let tokenCounter = -1;
    for ( tokenCounter = 0; tokenCounter < statementParts.length; tokenCounter++ ) 
    { currentToken = statementParts[tokenCounter];
      if ( this.#sqlKeyWord.includes ( currentToken.toUpperCase() ) ) 
      { switch ( currentToken.toUpperCase() ) 
        { case 'SELECT': 
            tokenCounter = this.parseSelectAttr ( tokenCounter, statementParts );
            break;
          case 'FROM':
            tokenCounter = this.parseFromAttrs(tokenCounter, statementParts);
            // Ensure rawData is set BEFORE calling getRawMemoryData
            let kindOfSelect = this.getTypeOfCursor().toUpperCase();
            if ( kindOfSelect === 'MEMORY' ) 
            { // Ensure we retrieve memory data AFTER parseFromAttrs
              let rawData = this.getRawMemoryData(); 
              if ( rawData ) 
              { let memorySourceType = this.getMemorySourceType();
                this.extractMemoryData(rawData, memorySourceType);
              } 
              else 
              { console.log("--*** No raw MEMORY data found after FROM processing.");
              } // End else
            } // End if (MEMORY)
            else 
            { // Ensure file-based sources (CSV, JSON) correctly store the file path
              this.#fromFileSpec = statementParts[tokenCounter];
              if ( doesFileExist ( this.filespec ) )
              { console.log ( '--*** Warning: fileSpec not found : "' + this.filespec + '"' );
              } // End if
              // console.log("--+++ Debug: Set filespec for non-MEMORY source:", this.filespec );
            } // End else
            break;
          case 'WHERE':
            tokenCounter = this.parseWhereExp ( tokenCounter, statementParts );
            break;
          case 'ORDER':
            tokenCounter = this.parseOrderBy ( tokenCounter, statementParts );
            break;
          case 'JOIN': case 'ON':
            let errorMessage 
              = '--*** ' + currentToken.toUpperCase() 
                + ' operations not supported, statement ignored.';
            console.log ( errorMessage );
            tokenCounter = this.skipToNextReservedWord ( tokenCounter, statementParts );
            break;
        } // End switch
      } // End if
    } // End for
    this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.parseCursorStatement ->\n' + this.  toJSON() );
  } // End function parseCursorStatement

    skipToNextReservedWord ( tokenCounter, statementParts )
    { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.skipToNextReservedWord -> ' + tokenCounter );
      let skipTokenCounter = tokenCounter;
      for ( skipTokenCounter = tokenCounter; 
            skipTokenCounter < statementParts.length;
            skipTokenCounter++
          )
      { let skippedToken =  statementParts [ skipTokenCounter ];
        if ( this.#sqlKeyWord.includes ( skippedToken ) )
        { break; 
        } // end if
      } // End for
      tokenCounter = skipTokenCounter;
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.skipToNextReservedWord -> ' + tokenCounter );
      return tokenCounter;
    } // End function skipToNextReservedWord

    makeAliasIfNeeded ( tokenCounter )
    { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.makeAliasIfNeeded -> ' + this.#attributeDesc.length );
      let localResult = false;
      let mathRegEx = /[\+\-\*\\\=\(\)]/g;
      let expression = this.#attributeDesc[0];
      if ( this.#attributeDesc.length === 1 )
      { let foundExpression = expression.search ( mathRegEx );
        if ( foundExpression >= 0 && expression.trim() !== '*' )
        { let newExpression = 'exp' + tokenCounter;
          console.log ( '--*** Found mathematical expression "' + expression + '" with no alias, alias generated "' + newExpression + '"' );
        } // End if
        
        localResult = true;
        this.addToAttributeDesc ( expression );
      } // End if
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.makeAliasIfNeeded -> ' + localResult );
      return localResult;
    } // End 

    parseSelectAttr ( startingTokenCounter, statementParts )
    { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.parseSelectAttr -> ' + startingTokenCounter );
      let currentToken;
      let tokenCounter;
      let mode = statementParts [ startingTokenCounter ];
      startingTokenCounter++;
      for ( tokenCounter = startingTokenCounter; 
            tokenCounter < statementParts.length;
            tokenCounter++
          )
      { currentToken =  statementParts [ tokenCounter ];
        if ( this.#sqlKeyWord.includes ( currentToken ) )
        { // Encountered a SQL Reserved word, parse is over.
          this.makeAliasIfNeeded ( tokenCounter );
          if ( this.#attributeDesc.length > 0 )
          { this.addToAttributeStack ( this.#attributeDesc );
          } // End if
          this.addToQueryComponent ( mode, this.#attributeStack );
          this.#attributeDesc = [];
          this.#attributeStack = [];
          tokenCounter--;
          break;
        } // End if
        else
        { if ( currentToken !== '\n' &&  currentToken.trim().toUpperCase() !== 'AS' )
          { if ( currentToken === ','  )
            { if ( this.#attributeDesc.length > 0 )
              { if ( ! this.makeAliasIfNeeded ( tokenCounter ) )
                { this.addToAttributeStack ( this.#attributeDesc );
                } // End if
              } // End if
              this.#attributeDesc = [];
            } // End if
            else
            { this.addToAttributeDesc ( currentToken );
            } // End else
          } // End if
          else
          { // Ignore the token
          } // End else
        } // End else
      } // End for
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.parseSelectAttr -> ' + tokenCounter );
      return tokenCounter;
    } // End parseSelectAttr

    parseFromAttrs ( startingTokenCounter, statementParts ) 
    { this.#templateGlobalContext.consoleTrace 
        ( 'Starting CursorStatement.parseFromAttrs -> ' + startingTokenCounter );
    
      let currentToken;
      let tokenCounter;
    
      // Move past "FROM" to get the correct mode
      startingTokenCounter++;
      let sourceType = statementParts[startingTokenCounter].toUpperCase(); // LIST or JSON
      startingTokenCounter++;
    
      let fromClause = [];
    
      for ( tokenCounter = startingTokenCounter; tokenCounter < statementParts.length; tokenCounter++ ) 
      { currentToken = statementParts[tokenCounter];
    
        // Stop parsing if we hit a new SQL keyword (meaning FROM parsing is done)
        if ( this.#sqlKeyWord.includes( currentToken.toUpperCase() ) ) 
        { tokenCounter--; // Move back to re-process the keyword
          break;
        } // End if
    
        fromClause.push( currentToken );
      } // End for
    
      // Save FROM clause properly in queryComponent
      this.#queryComponent.set( 'FROM', fromClause );
    
      // Store raw memory data (LIST or JSON)
      if ( ['LIST', 'JSON'].includes ( sourceType ) )  
      { this.#fromFileSpec = null;
        let extractedRawData = fromClause.join(' ').trim(); // Convert list back to a string
    
        // LIST should NOT require `{}` braces (fix)
        if ( sourceType === 'LIST' ) 
        { this.#rawMemoryData = extractedRawData; 
        } 
        // JSON should still require `{}` for proper parsing
        else if ( sourceType === 'JSON' && extractedRawData.startsWith('{') && extractedRawData.endsWith('}') ) 
        { this.#rawMemoryData = extractedRawData;
        } 
        else 
        { console.log("--*** Warning: MEMORY source does not have a valid data block `{}`.");
        } // End else
      } // End if (LIST or JSON)
    
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.parseFromAttrs -> ' + tokenCounter );
      return tokenCounter;
    } // End parseFromAttrs


    /**
     * Extracts and processes inline MEMORY data (LIST or JSON).
     * @param {string} rawData - The raw data from the statement.
     * @param {string} format - The format type ('LIST' or 'JSON').
     * @returns {object|array} The parsed data.
     */
    extractMemoryData ( rawData, format ) 
    { this.#templateGlobalContext.consoleTrace 
        ( 'Starting CursorStatement.extractMemoryData -> ' + format );
      let cleanedData = rawData.trim();
      let extractedData;
      if ( format === 'LIST' ) 
      { if ( cleanedData.startsWith('{') && cleanedData.endsWith('}') ) 
        { cleanedData = cleanedData.slice(1, -1).trim();
        } // End if
        extractedData = cleanedData.split(',').map(item => item.trim());
        let columnAlias = this.#queryComponent.get('SELECT')[0][1];
      } // End if
      else if ( format === 'JSON' ) 
      { try 
        { extractedData = JSON.parse ( cleanedData );
        } // End try
        catch ( error ) 
        { console.error('--*** Invalid JSON data:', cleanedData);
          extractedData = {}; // Ensure return type consistency
        } // End catch
      } // End else if
      else 
      { extractedData = cleanedData;
      } // End else
      this.#templateGlobalContext.consoleTrace 
        ( 'Finishing CursorStatement.extractMemoryData -> ' 
          +  extractedData
        );
      this.#inlineMemoryData = extractedData;
      return extractedData;
    } // End extractMemoryData


/**
 * Extracts a JSON structure from a cursor statement.
 * Supports JSON defined in { ... } brackets.
 *
 * @param {number} startTokenCounter - The index where the JSON starts (at `{`).
 * @param {Array} statementParts - Tokenized cursor statement.
 * @returns {string} Extracted JSON string.
 */
extractJson( rawJsonText ) 
{ 
  this.#templateGlobalContext.consoleTrace ( 'Starting extractJson -> ' + rawJsonText );

  try 
  { 
    // Remove outer `{}` before parsing
    let jsonObject = JSON.parse(rawJsonText);

    // If it's an array, return it directly
    if ( Array.isArray(jsonObject) ) 
    { return jsonObject;
    } // End if

    // If it's an object, convert it into a table-like format
    let structuredJson = Object.keys(jsonObject).map( key => ({ [key]: jsonObject[key] }) );

    this.#templateGlobalContext.consoleTrace ( 'Finishing extractJson -> ' + JSON.stringify(structuredJson) );

    return structuredJson;
  } 
  catch ( error ) 
  { 
    console.log ( '--*** Error parsing JSON in extractJson: ' + error.message );
    return [];
  } // End try-catch
} // End function extractJson

/**
 * Extracts a LIST structure from a cursor statement.
 * Supports LIST defined in { val1, val2, ... } format.
 *
 * @param {number} startTokenCounter - The index where the list starts (at `{`).
 * @param {Array} statementParts - Tokenized cursor statement.
 * @returns {Array} Extracted list of values.
 */
extractList( rawListText ) 
{ 
  this.#templateGlobalContext.consoleTrace ( 'Starting extractList -> ' + rawListText );

  // Remove outer curly braces `{ ... }` and split by commas
  let listItems = rawListText.replace(/^\{|\}$/g, '').split(',');

  // Trim whitespace and store as an array of objects
  let structuredList = listItems.map( item => ({ value: item.trim() }) );

  this.#templateGlobalContext.consoleTrace ( 'Finishing extractList -> ' + JSON.stringify(structuredList) );
  
  return structuredList;
} // End function extractList



    parseWhereExp ( startingTokenCounter, statementParts )
    { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.parseWhereExp -> ' + startingTokenCounter );
      let currentToken = '';
      let tokenCounter;
      let whereExpression = '';
      let mode = 'WHERE';
      startingTokenCounter++;
      let condition = '';
      let operand   = '';
      for ( tokenCounter = startingTokenCounter; 
            tokenCounter < statementParts.length && !this.#sqlKeyWord.includes ( statementParts [ tokenCounter ] );
            tokenCounter++
          )
      { currentToken +=  statementParts [ tokenCounter ].trim();
      }  // End for
      let subTokens = currentToken.split ( /\s+/g );
      for ( let subTokenCounter = 0;
                subTokenCounter < subTokens.length;
                subTokenCounter++
          )
       { let subToken = subTokens [ subTokenCounter ].trim();
         if ( this.#sqlWhereOperators.includes ( subToken.toUpperCase() ) )
         { this.addToAttributeDesc ( operand );
           this.addToAttributeDesc ( condition );
           this.#attributeDesc = [];
           condition = '';
           operand = subToken;
         } // end if
         else if ( subTokenCounter === (subTokens.length - 1) )
         { condition += subToken;
           this.addToAttributeDesc ( operand );
           this.addToAttributeDesc ( condition );
           this.#attributeDesc = [];
           break;
         } // End else if
         else
         { condition += subToken;
         } // End else
       } // End if
      this.addToQueryComponent ( mode, this.#attributeStack );
      this.#attributeStack = [];
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.parseWhereExp -> ' + tokenCounter );
      return tokenCounter-1;
    } // End parseWhereExp

    parseOrderBy ( startingTokenCounter, statementParts )
    { this.#templateGlobalContext.consoleTrace ( 'Starting parseOrderBy -> ' + startingTokenCounter );
      let currentToken = '';
      let tokenCounter;
      let orderingDirection;
      let whereExpression = '';
      let mode = 'ORDER';
      if (  statementParts [ startingTokenCounter+1 ] !== 'BY' )
      { let errorMessage = '--*** Poorly formed ORDER statement, BY assumed! ';
        console.log ( errorMessage );
      } // End if
      else
      { startingTokenCounter++;
      } // End if
      startingTokenCounter++;
      for ( tokenCounter = startingTokenCounter; 
            tokenCounter < statementParts.length && !this.#sqlKeyWord.includes ( statementParts [ tokenCounter ] );
            tokenCounter++
          )
      { currentToken = statementParts [ tokenCounter ].trim();
        if ( currentToken.length > 0 )
        { if ( currentToken === ',' && this.#attributeDesc.length <= 1 )
          { this.addToAttributeDesc ( 'ASC' );
            this.#attributeDesc = [];
          } // End if
          else
          { this.addToAttributeDesc ( currentToken );
          } // End if
        } // End if
      }  // End for
      if ( this.#attributeDesc.length < 2 )
      { this.addToAttributeDesc ( 'ASC' );
      } // End if
      this.addToQueryComponent ( mode, this.#attributeStack );
      this.#attributeDesc = [];
      this.#attributeStack = [];
      this.#templateGlobalContext.consoleTrace ( 'Finishing parseOrderBy -> ' + tokenCounter );
      return tokenCounter;
    } // End function parseOrderBy

    //===== Getters
      getCursorStatement()
      { return this. #cursorStatement;
      } // End function getCursorStatement

      getCursorType()
      { return this. #typeOfCursor;
      } // End function getCursorType

      getFromFileSpec() 
      { return this.#fromFileSpec || null;
      } // End function getFromFileSpec

      /**
       * Gets the extracted memory data.
       * @returns {Array|Object} The stored LIST or JSON memory data.
       */
      getInlineMemoryData() 
      { return this.#inlineMemoryData; 
      } // End getInlineMemoryData

      getNameOfCursor()
      { return this. #nameOfCursor;
      } // End function getNameOfCursor

    //===== Setters 

      setNameOfCursor ( nameOfCursor )
      { this.#templateGlobalContext.consoleTrace ( 'Starting  CursorStatement.setNameOfCursor : ' + nameOfCursor );
        let localResult = true;
        nameOfCursor = nameOfCursor.trim();
        if ( ! nameOfCursor || nameOfCursor.trim().length === 0 )
        { let errorMessage = '--*** The nameOfCursor can ot be null or empty.';
          console.log ( errorMessage );
          localResult = false;
        } // End if
        else
        { this.#nameOfCursor = nameOfCursor.trim();
        } // End else
        this.#templateGlobalContext.consoleTrace ( 'Finishing  CursorStatement.setNameOfCursor : ' + localResult );
        return localResult;
      } // End function setNameOfCursor
                      
      setCursorStatement ( cursorStatement )
      { this.#templateGlobalContext.consoleTrace ( 'Starting  CursorStatement.setCursorStatement : ' + cursorStatement );
        let localResult = true;
        if ( ! cursorStatement || cursorStatement.trim().length === 0 )
        { let errorMessage = '--*** The cursorStatement can ot be null or empty.';
          console.log ( errorMessage );
          localResult = false;
        } // End if
        else
        { this.#cursorStatement = cursorStatement.trim();
        } // End else
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.setCursorStatement : ' + localResult );
        return localResult;
      } // End function setCursorStatement

      setTypeOfCursor ( typeOfCursor )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.setTypeOfCursor : ' + typeOfCursor );
        let localResult = true;
        if ( !typeOfCursor || typeOfCursor.trim().length === 0 )
        { let errorMessage = '--*** The typeOfCursor can not be null or empty.';
          console.log ( errorMessage );
          localResult = false;
        } // End if
        typeOfCursor = typeOfCursor.trim().toUpperCase();
        if ( ! this.#typeOfCursorList.includes ( typeOfCursor ) )
        { let errorMessage = '--*** CURSOR TYPE of ' + typeOfCursor + ' must one of the following: ' + this.#typeOfCursorList.join(', ' );
          console.log ( errorMessage );
          localResult = false;
        } // End if
        else
        { this.#typeOfCursor = typeOfCursor.trim().toUpperCase();
        } // End else
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.setTypeOfCursor : ' + localResult );
        return localResult;
    } // End function setTypeOfCursor

      addToAttributeDesc ( expression )
      { this.#templateGlobalContext.consoleTrace
          ( 'Starting CursorStatement.addToAttributeDesc : ' 
            + expression 
          );
        this.#attributeDesc.push ( expression.trim() );
        if ( this.#attributeDesc.length >= 2 )
        { this.addToAttributeStack ( this.#attributeDesc );
          this.#attributeDesc = [];
        } // End if
        this.#templateGlobalContext.consoleTrace 
          ( 'Finishing CursorStatement.addToAttributeDesc  length:' 
            + this.#attributeDesc.length 
          );
      } // End 

      addToAttributeStack ( attributeDesc )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.addToAttributeStack : ' + JSON.stringify ( attributeDesc ) );
        if ( attributeDesc ) 
        { this.#attributeStack.push ( attributeDesc );
          this.#attributeDesc = [];
        } // End if
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.addToAttributeStack  length:' + this.#attributeStack.length );
      } // End addToAttributeStack

      addToQueryComponent ( mode, attributeStack )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.addToQueryComponent : ' + mode );
        this.#queryComponent.set ( mode, attributeStack );
        this.#attributeDesc = [];
        this.#attributeStack = [];
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.addToQueryComponent' );
      } // End addToQueryComponent 

      toJsonAttributeStack ( indent, attributeStack )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.toJsonAttributeStack ' );
        let jsonText = '';
        if ( !attributeStack )
        { attributeStack = this.#attributeStack;
        } // End if
        let delineator = ',';
        for ( let attributeCounter in attributeStack )
        { jsonText += ' '.repeat ( indent) + '[ ';
          let descriptorSeparator = ',';
          for ( let descriptorCounter in attributeStack [ attributeCounter ] )
          { jsonText += '"' + attributeStack [ attributeCounter ][descriptorCounter] + '"' + descriptorSeparator;
            descriptorSeparator = '';
          } // End for
          jsonText += ' ]' + delineator + '\n';
          if ( (+attributeCounter+2) === attributeStack.length )
          { delineator = '';
          } // End if
        } // End for
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.toJsonAttributeStack ' );
        // this.toJSON();
        return jsonText;
      } // End function toJsonAttributeStack

      toJsonQueryComponent ( indent, queryComponent )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.toJsonQueryComponent ' );
        let jsonText = '';
        if ( !queryComponent )
        { queryComponent = this.#queryComponent;
        } // End if
        let stackCounter = -1;
        let indentSpace = ' '.repeat ( indent );
        let values;
        for ( let componentName of queryComponent.keys() )
        { stackCounter++;
          jsonText += indentSpace + '"' + componentName + '",\n';
          values = queryComponent.get ( componentName );
          let stackText = this.toJsonAttributeStack ( indent+2, values  );
          jsonText += stackText;
        } // End for
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.toJsonQueryComponent ' );
        return jsonText;
      } // End function logQueryComponent

      logAttributeStack ( markerText, attributeStack )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.logAttributeStack ' );
        if ( ! markerText || markerText.trim().length === 0 ) 
        { markerText = 'log AttributeStack';
        } // End if
        if ( !attributeStack )
        { attributeStack = this.#attributeStack;
        } // End if
        for ( let attributeCounter in attributeStack )
        { console.log ( '-- ' + markerText + '   [' + attributeCounter + '] ->'  + attributeStack [ attributeCounter ] +  '<-' );
        } // End for
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.logAttributeStack ' );
      } // End function logAttributeStack

      logQueryComponent ( markerText, queryComponent )
      { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.logQueryComponent ' );
        if ( ! markerText ) 
        { markerText = 'log QueryComponent';
        } // End if
        if ( !queryComponent )
        { queryComponent = this.#queryComponent;
        } // End if
        let stackCounter = -1;
        for ( let componentName of this.#queryComponent.keys() )
        { stackCounter++;
          console.log ( '-- ' + markerText + '   [' + stackCounter + '] ->'  + componentName +  '<-' );
          this.logAttributeStack ( markerText + ' ->' , this.#queryComponent.get ( componentName ) );
        } // End for
        this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.logQueryComponent ' );
      } // End function logQueryComponent


    toJSON()
    { this.#templateGlobalContext.consoleTrace ( 'Starting CursorStatement.toJSON ' );
      let jsonText =  "\n{\n"
                    + "  \"nameOfCursor\"     : \"" + this.#nameOfCursor + "\",\n"
                    + "  \"typeOfCursor\"     : \"" + this.#typeOfCursor + "\",\n"
                    + "  \"cursorStatement\"  : \"\`\n" + this.#cursorStatement + "\n\`\"\n"
                    + "  \"queryComponent\"   : \n"
                    + "    {\n"
                    + this.toJsonQueryComponent ( 6 )
                    + "    }\n"
                    +"}\n";
      this.#templateGlobalContext.consoleTrace ( 'Finishing CursorStatement.toJSON'  );
      return jsonText;
    } // End function toJSON

  } // End Class CursorStatement

  function unitTestCursor()
  { let templateGlobalContext = new TemplateGlobalContext();
    let cursorCommand =  `_#CURSOR Domain_List CSV                 
                              SELECT Schema_Name SN,
                                     Package_Name PN,
                                     Domain_Name DN,
                                     Kind_of_Domain,
                                     NVL(Data_Type, "string"),
                                     Domain_Default,
                                     Character_Maximum_Length,
                                     Numeric_Precision,
                                     Numeric_Precision_Radix,
                                     Numeric_Scale,
                                     Maximum_Cardinality,
                                     UDT_Name
                               FROM dido_cm_domains.csv
                               JOIN ido_cm_domains.csv
                              WHERE Schema_Name = "_&SchemaName."
                                AND Package_Name = "_&PackageName."
                                AND Domain_Name = "_&DomainName."
                           ORDER BY Domain_Name,
                                    Maximum_Cardinality DESC,
                                    UDT_Name`;
      let metaCommandIndicator = templateGlobalContext.get ( 'metaCommandIndicator' );
      console.log ( '@@@@ metaCommandIndicator : ' + metaCommandIndicator );
      templateGlobalContext.setTraceState ( false );
      let cursorStatement = new CursorStatement ( templateGlobalContext );
      cursor.parseCursorStatement ( cursorCommand );
      console.log ( '#### cursorStatement ->\n' + cursorStatement.toJSON() );  
      
      console.log ( '#### Select Components -> ' + cursorStatement.getSelectComponents() );
      console.log ( '#### from Components -> ' + cursorStatement.getFromComponents() );
      console.log ( '#### Where Components -> ' + cursorStatement.getWhereComponents() );
      console.log ( '#### OrderBy Components -> ' + cursorStatement.getOrderByComponents() );
    // nameOfCursor, kindOfCursor, cursorStatement,
  } // End function unitTestCursor

/**
 * Defines a path to execute the unit test when this file is executed as a main.
 */
if (import.meta.url === 'file://'+process.argv[1]) 
{ // console.log ( "--*** No Unit Test Available " );
  unitTestCursor();
} // End if