import { SimpleFields } from "./ignoreCoverage/exampleDataClumps/java";
import Parser from "./ignoreCoverage/Parser";


async function main() {
  console.log('Start test');
  let parser = new Parser();
  console.log('Parser created');
  parser.addFileContentToParse('test.java', SimpleFields);
  console.log('File added');
  let result = parser.getFieldsAndMethods();
  console.log('File parsed');
  console.log(JSON.stringify(result, null, 2));
  /**
   [
   {
    "className": "Fields1",
    "listOfMemberVariables": [
      {
        "variableName": "normalString",
        "fieldType": "String",
        "key": "String normalString"
      },
      {
        "variableName": "arrayListWithString",
        "fieldType": "ArrayList<String>",
        "key": "ArrayList<String> arrayListWithString"
      },
      {
        "variableName": "arrayListWithIntegerObject",
        "fieldType": "ArrayList<Integer>",
        "key": "ArrayList<Integer> arrayListWithIntegerObject"
      },
      {
        "variableName": "mapWithArrayListOfStringAndInteger",
        "fieldType": "Map<ArrayList<String>, Integer>",
        "key": "Map<ArrayList<String>, Integer> mapWithArrayListOfStringAndInteger"
      }
    ]
  }
   ]
   */
  let fieldVariables = {}
  for(let classMember of result){
      let className = classMember.className;
    for(let memberVariable of classMember.listOfMemberVariables){
      let key = memberVariable.key;
        // @ts-ignore
        if(fieldVariables[key] === undefined){
            // @ts-ignore
            fieldVariables[key] = {

            };
        }
        // @ts-ignore
        fieldVariables[key][className] = true;
    }
  }

  console.log(JSON.stringify(fieldVariables, null, 2));

  // Ignore categoryMatches

}

main();
