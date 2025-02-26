/**
 * File: TypeStandards.js
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
 * @class TypeStandards
 * @description Describes a standard type definition.
 * @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
 * @since 10 December 2023
 * @version 1.0
 */

//===== Imports =====
import TemplateGlobalContext           from "./TemplateGlobalContext.js";
import Big                             from 'big.js';
import TableOfRecords                  from './TableOfRecords.js';
import * as TdlUtils                   from './TdlUtils.js';

//===== Class Definition =====
export default class TypeStandards
{ //===== Private
  /**
   * contains the singleton instances of the classes used by all the classes in the TemplateFoundry.
   * @type { TemplateGlobalContext }
   * @private
   */
   #templateGlobalContext;
   #columnNames;
   #defaultRowNumber;
   #fileSpecification;
   #tableBody;
   #tableOfStandards;

  //===== Constructors

  //----- Default Constructor
  constructor ( templateGlobalContext, fileSpecification, defaultRowNumber )
  { if ( ( !templateGlobalContext ) )
    { console.log ( '--*** No TemplateGlobalContext provided to TypeSupport, creating new local copy.' );
      templateGlobalContext = new TemplateGlobalContext();
    } // End if (
    templateGlobalContext.consoleTrace ( 'Starting TypeSupport Constructor' );
    this.#templateGlobalContext = templateGlobalContext;
    this.#fileSpecification = fileSpecification
                        || "Data/Common_Type_Definitions.csv";
    this.loadIsoIdlTypeDefinitions ( this.#fileSpecification );
    this.#defaultRowNumber  = defaultRowNumber
                              || 1;
    templateGlobalContext.consoleTrace ( 'Finishing TypeSupport Constructor' );
  } // End constructor TypeSupport

  //----- #validateRowNumber
  /**
   * #validateRowNumber is a private function used to validate a row number.
   * If the rowNumber is not in the correct range, the default row number
   * is substituted.
   * @param rowNumber is the row number to validate
   * @return the rowNumber passed or the default rowNumber if the rowNumber is not valid.
   */
  #validateRowNumber ( rowNumber )
  { let localResult 
       = ( TdlUtils.isNumeric ( rowNumber )
           && rowNumber >= 0 
           && rowNumber < this.#tableBody.length 
        )
         ? rowNumber 
         : this.#defaultRowNumber;
    return localResult;
  } // End function #validateRowNumber

  //----- #isNumericAndValidForBig
  /**
   * #isNumericAndValidForBig is a private function for validating 
   * valueString for use in the Big type.
   * @param valueString is a string containing the value for validating.
   * @return a Boolean indicating the valueString is a valid input
   * for use as a Big.
   */
  #isNumericAndValidForBig ( valueString ) 
  { let localResult = true;
    try 
    { // Attempt to create a Big instance with the valueString.
      new Big ( valueString );
    } // End catch
    catch  ( error ) 
    { localResult = false; // The string cannot be used with Big due to an error.
    } // End catch
    return localResult;
  } // End function isNumericAndValidForBig

  //----- #isValidateRowNumber
  /**
   * #isValidateRowNumber is a private function for validating a row number.
   * If the rowNumber is in the correct range, true is returned.
   * If the rowNumber is not in the correct range, false is returned.
   * @param rowNumber is the row number to validate
   * @return a Boolean indicating the rowNumber is valid.
   */
  #isValidateRowNumber ( rowNumber )
  { let localResult 
       = TdlUtils.isNumeric ( rowNumber )
         && rowNumber > 0 
         && rowNumber < this.#tableBody.length 
         ? true 
         : false;
    return localResult;
  } // End function #isValidateRowNumber

  loadIsoIdlTypeDefinitions ( fileName )
  { this.#tableOfStandards = new TableOfRecords 
                                   ( fileName, 
                                     this.#templateGlobalContext 
                                   );
    this.#columnNames      = this.#tableOfStandards.getColumnNames();
    this.#tableBody        = this.#tableOfStandards.getTable();
  } // End function loadIsoIdlTypeDefinitions

  //===== Getters

  //----- getColumnNames
  getColumnNames()
  { return this.#columnNames;
  } // End function getColumnNames

  //----- getRows
  getRows()
  { return this.#tableBody;
  } // End function getRows

  //----- getTableOfRecords
  getTableOfRecords()
  { return this.#tableOfStandards;
  } // End function getTableOfRecords

  getDefaultRowNumber()
  { return this.#defaultRowNumber;
  } // End function getDefaultRowNumber

  getDefaultRow()
  { return this.#tableOfStandards [ this.#defaultRowNumber ];
  } // End function getDefaultRow

  //----- getSeq
  /**
   * The getSeq function returns the value of the sequence number associated 
   * with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return an integer representing the sequence number contained in the row 
   * within the #tableBody table.
   */
  getSeq ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    return this.#tableBody [ rowNumber ] [ "Seq" ];
  } // End function getSeq

  //----- getName
  /**
   * The getName function returns the value of the Name associated 
   * with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return an string representing the ISO Name contained in the row 
   * within the #tableBody table.
   */
  getName ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    return this.#tableBody [ rowNumber ] [ "Name" ];
  } // End function getName

  //----- getConceptType
  /**
   * The getConceptType function returns the value of the conceptual type
   * associated with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return an string representing the Conceptual Type contained in the row 
   * within the #tableBody table
   */
  getConceptType ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    return this.#tableBody [ rowNumber ] [ "Concept_Type" ];
  } // End function getConceptType

  //----- getBitSize
  /**
   * The getBitSize function returns the value of the number of bits
   * associated with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return an integer representing the number of bits contained in the row 
   * within the #tableBody table
   */
  getBitSize ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    return this.#tableBody [ rowNumber ] [ "Bit_Size" ];
  } // End function getBitSize

  //----- getMinimum
  /**
   * The getMinimum function returns the value of the ISO minimum value 
   * associated with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return a Big representing the ISO minimum value contained in the row 
   * within the #tableBody table.
   */
  getMinimum ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    let valueString = this.#tableBody [ rowNumber ] [ "Minimum_Value" ];
    let largeValue
      = this.#isNumericAndValidForBig ( valueString ) 
        ? Big ( valueString )
        : undefined;
    return largeValue;
  } // End function getMinimum

  //----- getMaximum
  /**
   * The getMaximum function returns the value of the ISO maximum value 
   * associated with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return a Big representing the ISO maximum value contained in the row 
   * within the #tableBody table.
   */
  getMaximum ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    let valueString = this.#tableBody [ rowNumber ] [ "Maximum_Value" ];
    let largeValue
      = this.#isNumericAndValidForBig ( valueString ) 
        ? Big ( valueString )
        : undefined;
    return largeValue;
  } // End function getMaximum

  //----- getTotalDigits
  /**
   * The getTotalDigits function returns the value of Total_Digits 
   * associated with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return a Big representing the ISO maximum value contained in the row 
   * within the #tableBody table.
   */
  getTotalDigits ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    let valueString = this.#tableBody [ rowNumber ] [ "Total_Digits" ];
    return valueString;
  } // End function getTotalDigits

  //----- getFractionalDigits
  /**
   * The getFractionalDigits function returns the value of Total_Digits 
   * associated with a row within the private #tableBody table.
   * @param the rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return a Big representing the ISO maximum value contained in the row 
   * within the #tableBody table.
   */
  getFractionalDigits ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    let valueString = this.#tableBody [ rowNumber ] [ "Fractional_Digits" ];
    return valueString;
  } // End function getFractionalDigits
  
  //----- getDescription
  /**
   * The getDescription function returns the textual description for the type
   * associated with a row within the private #tableBody table.
   * @param rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the default rowNumber is used.
   * @return a Big representing the ISO maximum value contained in the row 
   * within the #tableBody table.
   */
  getDescription ( rowNumber )
  { rowNumber = this.#validateRowNumber ( rowNumber );
    let valueString = this.#tableBody [ rowNumber ] [ "Description" ];
    return valueString;
  } // End function getDescription

  //===== General Operations
  /**
   * findDefinition looks for an occurrence of isoNameTarget within the isoTypeDefinitions
   * table. The search is case insensitive.
   * @param nameOfDefinition is the name of the standardized type to look for within the TypeStandards table.
   * @return the row from the TypeStandards matching the name. Returns undefined if it is not found.
   */
  findDefinition ( nameOfDefinition )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeStandards findDefinition -> ' + isoNameTarget );
    let localResult;
    targetName = nameOfDefinition.trim().toUpperCase();
    for ( let rowCounter = 1; 
              rowCounter < this.#tableBody.length; 
              rowCounter++
        ) 
    { let standardName = this.#tableBody [ rowCounter ] [ "Common_Type_Name" ].trim().toUpperCase();
      if ( targetName === targetName ) 
      { localResult = this.#tableBody [ rowCounter ];
      } // End if
    } // End for rowCounter
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeStandards findDefinition -> ' + localResult );
    return localResult;
  } // End findDefinition

  //----- isInRange
  /**
   * isInRange checks a numeric value to determine if it is in the range for a particular row's
   * minimumValue and MaximumValue.
   * @param valueString is the value to check if it is in the range for the row.
   * @parm rowNumber of the entry in the #tableBody table.
   * If it is an invalid rowNumber, the result is false.
   * @return true if it is range, false for any other condition.
   */
  isInRange ( valueString, rowNumber )
  { let localResult = false;
    if ( this.#isValidateRowNumber ( rowNumber ) )
    { let largeValue
        = this.#isNumericAndValidForBig ( valueString ) 
          ? Big ( valueString )
          : undefined;
      localResult 
        = largeValue.gte ( this.getMinimum ( rowNumber ) )
          && largeValue.lte ( this.getMaximum (rowNumber ) );
    } // End if 
    return localResult;
  } // End isInRange

  //----- findSmallestType
  /**
   * findSmallestType loops through each of the entries in the 
   * TypeStandards and looks for the first match accommodating
   * the minimumValue, maximumValue for the specific conceptType.
   * @param minimumValue represents the minimum value in the range
   * of acceptable values.
   * @param maximumValue represents the maximum value in the range
   * of acceptable values.
   * @param conceptType represents the acceptable concept type of 
   * values.
   * @return the row in the TypeStandards table.
   */
  findSmallestType ( minimumValue, maximumValue, conceptType )
  { conceptType = conceptType
                  || 'Integer';
    conceptType = TdlUtils.toTitleSnakeCase ( conceptType );
    minimumValue
      = this.#isNumericAndValidForBig ( minimumValue ) 
        ? Big ( minimumValue )
        : undefined;
    maximumValue
      = this.#isNumericAndValidForBig ( maximumValue ) 
        ? Big ( maximumValue )
        : undefined;
    let localResult;
    for ( let rowCounter = 0; 
              rowCounter < this.#tableBody.length; 
              rowCounter++
        ) 
    { const rowConceptType = TdlUtils.toTitleSnakeCase ( this.getConceptType ( rowCounter ) );
      //console.log ( '=============-=-=-=-=-=--=-=-=-=-=' );
       //console.log ( '#####  rowCounter                     : "' + rowCounter + '"' );
       //console.log ( '#####  rowConceptType                 : "' + rowConceptType + '"' );
       //console.log ( '#####  conceptType                    : "' + conceptType  + '"' );
       //console.log ( '#####  minimumValue                   : ' + minimumValue?.constructor.name + '-> ' + minimumValue);
       //console.log ( '#####  this.getMinimum ( rowCounter ) : ' + this.getMinimum ( rowCounter )?.constructor.name  + '-> ' + this.getMinimum ( rowCounter ) );
       //console.log ( '#####  maximumValue                   : ' + maximumValue?.constructor.name  + '-> ' + maximumValue);
       //console.log ( '#####  this.getMaximum (rowCounter ) ): ' + this.getMaximum ( rowCounter )?.constructor.name  + '-> ' + this.getMaximum ( rowCounter ) );
       let localMinStringValue = this.getMinimum ( rowCounter )?.toString().trim();
       //console.log ( '#####  : ->' + localMinStringValue + '<-' );
       let localMinValue = new Big ( localMinStringValue );
       let localMaxStringValue = this.getMaximum ( rowCounter )?.toString().trim();
       //console.log ( '#####  : ->' + localMaxStringValue + '<-' );
       //console.log ( '#####  localMinValue                  : ' + localMinValue?.constructor.name + '-> ' + localMinValue);
       let localMaxValue = new Big ( localMaxStringValue );
       //console.log ( '#####  localMaxValue                  : ' + localMaxValue?.constructor.name + '-> ' + localMaxValue);
       //if (rowConceptType === conceptType)
       //{ console.log('RowConceptType matches ConceptType');
       //} // End if
       //if ( minimumValue.gte ( localMinValue ) ) 
       //{ console.log('MinimumValue >= Row Minimum');
       //} // End if
       //if ( maximumValue.lte ( localMaxValue ) ) 
       //{ console.log('MaximumValue <= Row Maximum');
       //} // End if
       if ( rowConceptType == conceptType
           && minimumValue.gte ( this.getMinimum ( rowCounter ) )
           && maximumValue.lte ( this.getMaximum ( rowCounter ) )
         )
      { localResult = this.#tableBody [ rowCounter ];
        //console.log ( '##### Yes, we have a record' );
        break;
      } // End if
      // console.log ( '##### No, not yet' );
    } // End for rowCounter
    return localResult;
  } // End function findSmallestType

   //----- toJSON
  /**
   * toJSON converts the values within the isoTypeDefinition table to
   * JSON.
   * @return the JSON string representation of the isoTypeDefinition table.
   */
  toJSON ()
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeStandards toJSON '  );
    let delimiter = ',';
    let tableLength = this.#tableBody.length;
    let jsonText
      =  '\n[\n'
         + '  "TypeStandards"          : \n [\n';
    for ( let rowCounter = 0; 
              rowCounter < tableLength; 
              rowCounter++
        ) 
    { if ( rowCounter >= ( tableLength-1 ) )
      { delimiter = '';
      } // End if
      jsonText += this.tableRowToJSON ( this.#tableBody [ rowCounter ], delimiter, 2 );
    } // End for rowCounter
    jsonText += ' ]\n';
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeStandards toJSON ->\n'  + jsonText );
    return jsonText;
  } // End function toJSON
 
  //----- tableRowToJSON
  /**
   * tableRowToJSON converts the values within a row within the private 
   * #tableBody table to a JSON string.
   * @param rowNumber is a row from within the #tableBody table.
   * @return the JSON string representation of a row in #tableBody table table.
   */
  tableRowToJSON ( row, delimiter, indent )
  { this.#templateGlobalContext.consoleTrace ( 'Starting TypeStandards tableRowToJSON '  );
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
    let jsonText = '';
    if ( row )
    { jsonText
         =   ' '.repeat ( indent) + '  [ "Seq"               : "' + row [ "Seq" ]               + '",\n'
           + ' '.repeat ( indent) + '    "Source"            : "' + row [ "Source" ]            + '",\n'
           + ' '.repeat ( indent) + '    "Common_Type_Name"  : "' + row [ "Common_Type_Name" ]  + '",\n'
           + ' '.repeat ( indent) + '    "Concept_Type"      : "' + row [ "Concept_Type" ]      + '",\n'
           + ' '.repeat ( indent) + '    "bits"              : "' + row [ "bits" ]              + '",\n'
           + ' '.repeat ( indent) + '    "Minimum"           : "' + row [ "Minimum_Value" ]     + '",\n'
           + ' '.repeat ( indent) + '    "Maximum"           : "' + row [ "Maximum_Value" ]     + '",\n'
           + ' '.repeat ( indent) + '    "Total_Digits"      : "' + row [ "Total_Digits" ]      + '",\n'
           + ' '.repeat ( indent) + '    "Fractional_Digits" : "' + row [ "Fractional_Digits" ] + '",\n'
           + ' '.repeat ( indent) + '    "Description"       : "' + row [ "Description" ]       + '" \n'
           + ' '.repeat ( indent) + '  ]' + delimiter + '\n';
    } // End if
    this.#templateGlobalContext.consoleTrace ( 'Finishing TypeStandards tableRowToJSON '  );
    return jsonText;
  } // End function tableRowToJSON  

} // End Class TypeStandards

function unitTestTypeStandards()
{ console.log ( '-- Test 0.0 -- Starting TemplateGlobalContext constructor ' );
  let templateGlobalContext
    = new TemplateGlobalContext();
  console.log ( '-- Test 0.1 -- Finishing TemplateGlobalContext constructor' );
  let minValue = 0;
  let maxValue = 0;
  let commonTypeName = 'Integer';
  let rowData;
  let jasonText = '';
  let fileName = "Data/Common_Type_Definitions.csv";
  console.log ( '===== Test 1.0 ===== TypeStandards constructor, fileName: ' + fileName );
  let typeSupport = new TypeStandards ( templateGlobalContext, fileName );
  console.log ( '===== Test 2.0 =====');
  console.log ( '--  converting toJSON --');
  jasonText = typeSupport.toJSON();
  console.log ( '-- Table toJSON:\n' + jasonText);
  console.log ( '===== Test 3.0 =====');
  console.log ( '----- Test 3.1 -----');
  minValue = 0;
  maxValue = 200;
  commonTypeName = 'Integer';
  console.log ( '-- findSmallestType --  ' + commonTypeName + ' :== ' + minValue + '..' + maxValue );
  rowData = typeSupport.findSmallestType ( minValue, maxValue, commonTypeName );
  jasonText = typeSupport.tableRowToJSON ( rowData );
  console.log ( '-- Row toJSON:\n' + jasonText);
  console.log ( '----- Test 3.2 -----');
  minValue = -100;
  maxValue = +100;
  commonTypeName = 'Integer';
  console.log ( '-- findSmallestType --  ' + commonTypeName + ' :== ' + minValue + '..' + maxValue );
  rowData = typeSupport.findSmallestType ( minValue, maxValue, commonTypeName );
  jasonText = typeSupport.tableRowToJSON ( rowData );
  console.log ( '-- Row toJSON:\n' + jasonText);
  console.log ( '----- Test 3.3 -----');
  minValue = 0;
  maxValue = +32767;
  commonTypeName = 'Integer';
  console.log ( '-- findSmallestType --  ' + commonTypeName + ' :== ' + minValue + '..' + maxValue );
  rowData = typeSupport.findSmallestType ( minValue, maxValue, commonTypeName );
  jasonText = typeSupport.tableRowToJSON ( rowData );
  console.log ( '-- Row toJSON:\n' + jasonText);
console.log ( '----- Test 3.4 -----');
  minValue = "-1.7976931348623155E+308";
  maxValue = 10.000;
  commonTypeName = 'Real';
  console.log ( '-- findSmallestType --  ' + commonTypeName + ' :== ' + minValue + '..' + maxValue );
  rowData = typeSupport.findSmallestType ( minValue, maxValue, commonTypeName );
  jasonText = typeSupport.tableRowToJSON ( rowData );
  console.log ( '-- Row toJSON:\n' + jasonText);
  //typeSupport.dumpTableOfStandards();
} // End function unitTestTypeStandards

if (import.meta.url === 'file://'+process.argv[1]) 
{ unitTestTypeStandards();
} // End if