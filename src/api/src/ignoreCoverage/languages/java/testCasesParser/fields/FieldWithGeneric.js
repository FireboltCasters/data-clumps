import {TestCaseBaseClassForParser} from "../../../../TestCaseBaseClassForParser";
import {MyFile} from "../../../../ParsedAstTypes";

const FileA = new MyFile('javaParserTest/Main.java', `
package javaParserTest;

import javax.swing.Icon;
import java.util.HashMap;

public class Main<T> {
  private static MyGeneric<String> myGeneric;
  private static Type<?> genericNormal;
  private static Type<? extends Icon> genericExtends;
  private static Type<? super Icon> genericSuper;
  // private static Type<? extends Icon & Number> genericExtendsAndInterface; // this is not allowed in java as a field type
  private static HashMap<? extends Icon, ? super Number> genericExtendsAndSuperHashMap;
}
`);

export const FieldWithGeneric = new TestCaseBaseClassForParser(
    'FieldWithGeneric',
    [FileA],
    [FileA.getFileExtension()],
    []
);
