import {TestCaseBaseClass} from "./TestCaseBaseClass";
import {ParameterTypeContext, ParameterTypeContextUtils} from "./ParsedTypes";

export class TestCaseBaseClassForDataClumps extends TestCaseBaseClass{
    public dataClumps: ParameterTypeContext[];

    public constructor(name, files, dataClumps){
        super(name, files, ParameterTypeContextUtils.parametersToString(dataClumps));
        this.dataClumps = dataClumps;
    }
}
