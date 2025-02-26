/**
 * File: TypeSupport.js
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
 * @class TypeSupport
 * @description defines the rosette stone of type conversions.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext from './TemplateGlobalContext.js';
import Big                   from 'big.js';
import TableOfRecords        from './TableOfRecords.js';
import TypeStandards         from './TypeStandards.js';
import * as TdlUtils         from './TdlUtils.js';

//===== Class Definition =====
export default class TypeSupport
{ //===== Private
  #templateGlobalContext;
  #tableBody;
  #columnNames;
  #tableOfTypeDefinitions;
  #typeStandards;
  // Constants identifying the default row within isoTypeDefinitions

  //===== Constructors

  //----- Default Constructor
  constructor ( templateGlobalContext )
  { if ( ( !templateGlobalContext ) )
    { console.log ( '--*** No TemplateGlobalContext provided to TypeSupport, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if (
    templateGlobalContext.consoleTrace ( 'Starting TypeSupport Constructor' );
    this.#templateGlobalContext = templateGlobalContext;
    this.#typeStandards = this.#templateGlobalContext.getTypeStandards();
    let fileName = "Data/TDL_Language_Type_Map.csv";
    this.loadLanguageTypeMapping ( fileName );
    templateGlobalContext.consoleTrace ( 'Finishing TypeSupport Constructor' );
  } // End constructor TypeSupport

  //===== Private Functions

  //----- #fixHexadecimalValues
  #fixHexadecimalValues ( stringValueOfNumber ) 
  { stringValueOfNumber = stringValueOfNumber.replace(/^#/, "0x");
    const hexPattern = /^0x[0-9A-Fa-f]+$/;
    let isHexadecimalValue =  hexPattern.test ( stringValueOfNumber) ;
    let localResult = stringValueOfNumber;
    if ( isHexadecimalValue )
    { localResult = parseInt ( stringValueOfNumber, 16 );
    } // End if
    else
    { localResult = new Big ( stringValueOfNumber );
    } // End else
    return localResult;
  } // End function #fixHexadecimalValues

  //===== Public Functions

  //----- loadLanguageTypeMapping
  loadLanguageTypeMapping ( fileName )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeSupport loadLanguageTypeMapping -> '  + fileName );
    this.#tableOfTypeDefinitions 
      = new TableOfRecords ( fileName, this.#templateGlobalContext );
    this.#columnNames = this.#tableOfTypeDefinitions.getColumnNames();
    this.#tableBody = this.#tableOfTypeDefinitions.getTable();
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeSupport loadLanguageTypeMapping' );
  } // End function loadLanguageTypeMapping

  //----- findCommonTypeDefinition
  findCommonTypeDefinition ()
  { this.#typeStandards
    for ( let rowCounter = 1; 
              rowCounter < tableLength;
              rowCounter++
          ) 
    { rowData = this.#typeStandards.findSmallestType ( value, commonTypeName );
    } // End for rowCounter
  } // End findCommonTypeDefinition

  //----- toJSON
  toJSON ()
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeSupport toJSON '  );
    let delimiter = ',';
    let tableLength = this.#tableBody.length;
    let jsonText
      =  '\n{\n'
         + '  "TypeSupport"          : \n [\n';
    for ( let rowCounter = 1; 
              rowCounter < tableLength;
              rowCounter++
          ) 
    { if ( rowCounter >= ( tableLength-1 ) )
      { delimiter = '';
      } // End if
      jsonText += this.tableRowToJSON ( this.#tableBody [ rowCounter ], delimiter, 2 );
    } // End for rowCounter
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeSupport toJSON '  );
    return jsonText;
  } // End function toJSON

  //----- tableRowToJSON
  tableRowToJSON ( row, delimiter, indent )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeSupport tableRowToJSON '  );
    if ( indent === null 
         || ( typeof indent === 'string' 
              && indent === ''
            ) 
         || ( typeof indent === 'number' 
              && isNaN(indent)
          )
       ) 
    { indent = 0;
    } // En if indent
    if ( delimiter == null )
    { delimiter = ','
    } // End if
    let bracketText = '[ ';
    let jsonText = '';
    if ( row )
    { jsonText
          =   ' '.repeat ( indent) + '  [ "Common_Type_Name"   : "' + row [ "Common_Type_Name" ]   + '",\n'
            + ' '.repeat ( indent) + '    "Char"               : "' + row [ "Char" ]               + '",\n'
            + ' '.repeat ( indent) + '    "Octet"              : "' + row [ "Octet" ]              + '",\n'
            + ' '.repeat ( indent) + '    "Short"              : "' + row [ "Short" ]              + '",\n'
            + ' '.repeat ( indent) + '    "Unsigned_Short"     : "' + row [ "Unsigned_Short" ]     + '",\n'
            + ' '.repeat ( indent) + '    "Long"               : "' + row [ "Long" ]               + '",\n'
            + ' '.repeat ( indent) + '    "Unsigned_Short"     : "' + row [ "Unsigned _Short" ]     + '",\n'
            + ' '.repeat ( indent) + '    "Long"               : "' + row [ "Long" ]               + '",\n'
            + ' '.repeat ( indent) + '    "Unsigned_Long"      : "' + row [ "Unsigned_Long" ]      + '",\n'
            + ' '.repeat ( indent) + '    "Unsigned_Long_Long" : "' + row [ "Unsigned_Long_Long" ] + '" \n'
            + ' '.repeat ( indent) + '    "Long_Long"          : "' + row [ "Long_Long" ]          + '" \n'
            + ' '.repeat ( indent) + '    "Float"              : "' + row [ "Float" ]              + '" \n'
            + ' '.repeat ( indent) + '    "Double"             : "' + row [ "Double" ]             + '" \n'
            + ' '.repeat ( indent) + '    "Long_Double"        : "' + row [ "Long_Double" ]        + '" \n'
            + ' '.repeat ( indent) + '    "Boolean"            : "' + row [ "Boolean" ]            + '" \n'
            + ' '.repeat ( indent) + '    "String"             : "' + row [ "String" ]             + '" \n'
            + ' '.repeat ( indent) + '  ]' + delimiter + '\n';
    } // End if
    jsonText += ' ]\n';
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeSupport tableRowToJSON ->\n'  + jsonText );
    return jsonText;
  } // End function tableRowToJSON

  //----- setTableDefinitions
  setTableDefinitions ( fileName )
  { this.#tableOfTypeDefinitions 
      = new TableOfRecords ( fileName, this.#templateGlobalContext );
    let columnNames = this.#tableOfTypeDefinitions.getColumnNames();
    let tableBody = this.#tableOfTypeDefinitions.getTable();
    for ( let rowCounter = 0; 
              rowCounter < tableBody.length; 
              rowCounter++
        ) 
    { // "Schema_Name","Package_Name","Domain_Name","Domain_Kind","Concept_Type","Minimum_Value","Maximum_Value","Default_Value","Description"
      // "Schema_Name","Package_Name","Domain_Name","Domain_Kind","Concept_Type","Minimum_Value","Maximum_Value","Default_Value","Description"

      let currentRow     = tableBody [ rowCounter ];
      const typeName     = currentRow [ "Domain_Name"  ];
      const conceptType  = currentRow [ "Concept_Type"  ];
      const minimumValue = currentRow [ "Minimum_Value" ];
      const maximumValue = currentRow [ "Maximum_Value" ];
      const defaultValue = currentRow [ "Default_Value" ];
      const description  = currentRow [ "Description" ];
      this.defineTypeVariables
       ( typeName,  
         conceptType, 
         minimumValue, 
         maximumValue, 
         defaultValue,
         description
       );
     } // End for
  } // End function setTableDefinitions

  //----- defineTypeVariables
  defineTypeVariables
    ( typeName, 
      conceptType, 
      minimumValue, 
      maximumValue, 
      defaultValue,
      description
    )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeSupport defineTypeVariables '  );
    typeName = TdlUtils.toUpperCamelCase ( typeName.trim() );
    conceptType = conceptType
                  || 'Integer';
    conceptType = TdlUtils.toTitleSnakeCase ( conceptType.trim() );
    minimumValue = this.#fixHexadecimalValues ( minimumValue );
    maximumValue = this.#fixHexadecimalValues ( maximumValue );
    defaultValue = this.#fixHexadecimalValues ( defaultValue );
    let localResult = this.#typeStandards.findSmallestType ( minimumValue, maximumValue, conceptType );
    // console.log ( '##### localResult : ' + localResult );
    if ( localResult )
    { let defineVariable = this.#templateGlobalContext.getLocalVariableStack();
      let metaSettings   = this.#templateGlobalContext.getMetaSettings();
      let pseudoElement  = typeName + TdlUtils.PSEUDO_ELEMENT;
      //"Seq","Source","Common_Type_Name","Concept_Type","Bit_Size","Minimum_Value","Maximum_Value","Total_Digits","Fractional_Digits","Description"
      defineVariable.set ( pseudoElement + 'Com_Seq',               localResult [ "Seq" ] );
      defineVariable.set ( pseudoElement + 'Com_Source',            localResult [ "Source" ] );
      defineVariable.set ( pseudoElement + 'Com_Name',              localResult [ "Common_Type_Name" ] );
      defineVariable.set ( pseudoElement + 'Com_ConceptType',       localResult [ "Concept_Type" ] );
      defineVariable.set ( pseudoElement + 'Com_Bits',              localResult [ "Bit_Size" ] );
      defineVariable.set ( pseudoElement + 'Com_Minium',            localResult [ "Minimum_Value" ] );
      defineVariable.set ( pseudoElement + 'Com_Maximum',           localResult [ "Maximum_Value" ] );
      defineVariable.set ( pseudoElement + 'Com_TotalDigits',       localResult [ "Total_Digits" ] );
      defineVariable.set ( pseudoElement + 'Com_FractionalDigits',  localResult [ "Fractional_Digits" ] );
      defineVariable.set ( pseudoElement + 'Com_Description',       localResult [ "Description" ] );
      defineVariable.set ( pseudoElement + 'Type_Name',             typeName  );
      defineVariable.set ( pseudoElement + 'Minimum',               minimumValue );
      defineVariable.set ( pseudoElement + 'Maximum',               maximumValue );
      defineVariable.set ( pseudoElement + 'Default',               defaultValue );
      defineVariable.set ( pseudoElement + 'Description',           description );
      let targetTypeName = TdlUtils.toTitleSnakeCase ( localResult [ "Common_Type_Name" ] );
      for ( let rowCounter = 1;
                rowCounter < this.#tableBody.length;
                rowCounter++
          )
      { let row = this.#tableBody [ rowCounter ];
        let typePseudoElement 
          = pseudoElement 
            + row [ "Common_Type_Name" ];
            // + TdlUtils.PSEUDO_ELEMENT 
            // + TdlUtils.toTitleSnakeCase ( targetTypeName );
        // "Common_Type_Name","char","octet","short","unsigned short","long","unsigned long","unsigned long long","long long","float","double ","long double","boolean","string"
        // console.log ( '##### ====================-=-=-=-==---=-=-=-=-=-=-=-=' );
        // console.log ( '#####  targetTypeName                   : "' + targetTypeName + '"' );
        // console.log ( '#####  pseudoElement                    : "' + pseudoElement  + '"' );
        // console.log ( '#####  typePseudoElement                : "' + typePseudoElement  + '"' );
        // console.log ( '#####  row [ "Common_Type_Name" ]       : "' + row [ targetTypeName ] + '"' );
        // console.log ( '##### YES, DEFINE THE VARIABLE' );
        // this.#templateGlobalContext.setTraceState ( true );
        defineVariable.set ( typePseudoElement, row [ targetTypeName ] );
        // this.#templateGlobalContext.setTraceState ( false );
        //  console.log ( '#####  row ["Common_Type_Name"]    : ' + row [ "Common_Type_Name" ] );
        //  console.log ( '#####  row ["char"]                : ' + row [ "char"] );
        //  console.log ( '#####  row ["octet"]               : ' + row [ "octet"] );
        //  console.log ( '#####  row ["short"]               : ' + row [ "short"] );
        //  console.log ( '#####  row ["unsigned short"]      : ' + row [ "unsigned short"] );
        //  console.log ( '#####  row ["long"]                : ' + row [ "long"] );
        //  console.log ( '#####  row ["unsigned long"]       : ' + row [ "unsigned long"] );
        //  console.log ( '#####  row ["unsigned long long"]  : ' + row [ "unsigned long long"] );
        //  console.log ( '#####  row ["long long"]           : ' + row [ "long long"] );
        //  console.log ( '#####  row ["float"]               : ' + row [ "float"] );
        //  console.log ( '#####  row ["double "]             : ' + row [ "double "] );
        //  console.log ( '#####  row ["long double"]         : ' + row [ "long double"] );
        //  console.log ( '#####  row ["boolean"]             : ' + row [ "boolean"] );
        //  console.log ( '#####  row ["string"]              : ' + row [ "string"] );
      } // End for
    } // End if localResult
    else
    { let errorMessage 
         = 'Can NOT defineTypeVariables for, typeName: ' + typeName 
           + '\n conceptType: ' + conceptType
           + '\n minimumValue: ' + minimumValue
           + '\n maximumValue: ' + maximumValue;
      this.#templateGlobalContext.consoleWarn ( errorMessage );
    } // End else
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeSupport defineTypeVariables '  );
    return localResult;
  } // End defineTypeVariables    

} // End Class TypeSupport
     
function unitTestTypeSupport()
{ console.log ( '===== Test 0.0 =====' );
  console.log ( '----- Test 0.1 ----- Starting TemplateGlobalContext constructor' );
  let templateGlobalContext
    = new TemplateGlobalContext();
  templateGlobalContext.setWarnState ( true );
  console.log ( '-- Test 0.1 -- Finishing TemplateGlobalContext constructor' );
  console.log ( '===== Test 1.0 =====' );
  console.log ( '-- Test 1.0 -- Starting TypeSupport constructor' );
  let typeSupport 
    = new TypeSupport ( templateGlobalContext );
  console.log ( '-- Test 1.1 -- Finishing TypeSupport constructor' );
  console.log ( '-- Test 1.2 -- Starting TypeSupport toJSON' );
  console.log ( typeSupport.toJSON() );
  console.log ( '-- Test 1.3 -- Finishing TypeSupport toJSON' );
  console.log ( '===== Test 2.0 =====' );
  let fileName = 'Data/TDL_Language_Type_Map.csv';
  fileName = 'Data/geometry_domains.csv';
  typeSupport.setTableDefinitions ( fileName );
  templateGlobalContext.dumpGlobalsContext ( 'LOCAL' );
  return;

  let targetJavaType = 'int';
  console.log ( '===== Looking for ISO-IDL equivalent to JAVA ' + targetJavaType );
  let isoDefinition = typeSupport.getStdTypeBasedOnList ( targetJavaType, listOfJavaTypeNames );
  console.log ( '===== isoDefinition : \n' + typeSupport.isoTableRowToJSON ( isoDefinition ) );
  let valueString = -2147483649;
  let rowNumber = 5;
  let result = typeSupport.isInRange ( valueString, rowNumber );
  console.log ( '===== valueString: ' 
                + valueString 
                + ' range check: ' + result 
                + ' range: ' + typeSupport.getIsoMinimum ( rowNumber ) 
                + '..' + typeSupport.getIsoMaximum ( rowNumber )
              );
  typeSupport.defineTypeVariables ( 'myType', 'integer',  0, 512, 128 );
  templateGlobalContext.dumpGlobalsContext ( 'LOCAL' );
} // End function unitTestTypeSupport

if (import.meta.url === 'file://'+process.argv[1]) 
{ unitTestTypeSupport();
} // End if