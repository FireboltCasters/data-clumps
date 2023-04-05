import {SoftwareProject} from "./SoftwareProject";
import {
    ClassOrInterfaceTypeContext,
    MemberFieldTypeContext,
    MethodParameterTypeContext,
    MethodTypeContext, ParameterTypeContext
} from "./ParsedTypes";

export class DetectorOptions {
    public sharedDataFieldsMinimum: number = 3;
    public sharedDataFieldsHierarchyConsidered: boolean = false;
    public sharedMethodParametersMinimum: number = 3;
    public sharedMethodParametersHierarchyConsidered: boolean = false;

    public constructor(options: any){
        let keys = Object.keys(options || {});
        for (let key of keys) {
            // check if this key exists in this class
            if (this.hasOwnProperty(key)) {
                this[key] = options[key]; // set the value
            }
        }
    }
}

export class Detector {

    public options: DetectorOptions;

    public constructor(options: any){
        this.options = new DetectorOptions(options);
    }

    public detect(project: SoftwareProject){
        console.log("Detecting software project for data clumps");
        let commonMethodParameters = this.getCommonMethodParametersForSoftwareProject(project);
        console.log("Common method parameters: ");
        console.log(JSON.stringify(commonMethodParameters, null, 2));
    }

    private getCommonMethodParametersForSoftwareProject(project: SoftwareProject){
        let commonMethodParameters: any[] = [];
        let classesOrInterfaces = this.getClassesOrInterfaces(project);
        for (let i = 0; i < classesOrInterfaces.length; i++) {
            let class1 = classesOrInterfaces[i];
            for (let j = i + 1; j < classesOrInterfaces.length; j++) {
                let class2 = classesOrInterfaces[j];
                let commonParameters = this.getCommonMethodParametersForClassesOrInterfaces(class1, class2);
                commonMethodParameters = commonMethodParameters.concat(commonParameters);
            }
        }
        return commonMethodParameters;
    }

    private getClassesOrInterfaces(project: SoftwareProject){
        let classesOrInterfaces: ClassOrInterfaceTypeContext[] = [];
        let filePaths = project.getFilePaths();
        for (let filePath of filePaths) {
            let file = project.getFile(filePath);
            let ast = file.ast;
            let keys = Object.keys(ast);
            for (let key of keys) {
                let classOrInterface = ast[key];
                classesOrInterfaces.push(classOrInterface);
            }
        }

        return classesOrInterfaces;
    }

    private getCommonMethodParametersForClassesOrInterfaces(class1: ClassOrInterfaceTypeContext, class2: ClassOrInterfaceTypeContext){
        let commonMethodParameters: any[] = [];
        let methodKeys1 = Object.keys(class1.methods);
        let methodKeys2 = Object.keys(class2.methods);
        for (let methodKey1 of methodKeys1) {
            let method1 = class1.methods[methodKey1];
            for (let methodKey2 of methodKeys2) {
                let method2 = class2.methods[methodKey2];
                // TODO: add possibility to check if methods are equal: same name, same parameters, same return type
                let commonParameters = this.getCommonMethodParameters(method1, method2);
                if (commonParameters.length > 0) {
                    commonMethodParameters.push(commonParameters);
                }
            }
        }

        return commonMethodParameters;
    }

    private getCommonMethodParameters(method1: MethodTypeContext, method2: MethodTypeContext): MethodParameterTypeContext[]{
        let parameters1 = method1.parameters;
        let parameters2 = method2.parameters;
        let commonParametersContext = this.getCommonParameters(parameters1, parameters2);
        return commonParametersContext;
    }

    private getCommonParameters(parameters1: ParameterTypeContext[], parameters2: ParameterTypeContext[]){
        let commonParameters: ParameterTypeContext[] = [];
        for (let parameter1 of parameters1) {
            for (let parameter2 of parameters2) {
                if (this.isCommonParameter(parameter1, parameter2)) {
                    commonParameters.push(parameter1);
                }
            }
        }

        return commonParameters;
    }

    private isCommonParameter(parameter1: ParameterTypeContext, parameter2: ParameterTypeContext){
        return parameter1.name === parameter2.name && parameter1.type === parameter2.type;
    }

}
