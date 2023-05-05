import {TestCaseBaseClassForParser} from "../../../TestCaseBaseClassForParser";
import {MyFile} from "../../../ParsedAstTypes";

const FileA = new MyFile('hero/main/cool/Batman.java', `
package hero.main.cool;

public class Batman {
   public int a;
   public int b;
   public int c;
}`);

const FileB = new MyFile('hero/sidekick/Robin.java',`
package hero.sidekick;

import java.lang.Math; // import package with comment
import hero.main.cool.*; // import package with wildcard

public class Robin extends Batman {
   public int d;
}`);

// Theoreticly FileB and FileD should be same, since they share the same member fields: a, b, c, d
// Therefore, there should be a data clump between FileB and FileD
// What would be the best way to solve this?


export const ExtendingClassWithWildcardImport = new TestCaseBaseClassForParser(
    'ExtendingClassWithWildcardImport',
    [FileA, FileB],
    [FileA.getFileExtension()],
    []
);
