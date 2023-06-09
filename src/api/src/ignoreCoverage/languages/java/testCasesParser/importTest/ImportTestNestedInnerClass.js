import {TestCaseBaseClassForParser} from "../../../../TestCaseBaseClassForParser";
import {MyFile} from "../../../../ParsedAstTypes";

const FileA = new MyFile('javaParserTest/Main.java', `
package javaParserTest;
import javaParserTest.sub.Hero;

public class Main {
  Hero h; // Hero is not imported, but defined in the same file
  
  class Hero {}
}
`);

export const ImportTestInnerClass = new TestCaseBaseClassForParser(
    'ImportTestInnerClass',
    [FileA, FileB],
    [FileA.getFileExtension()],
    []
);
