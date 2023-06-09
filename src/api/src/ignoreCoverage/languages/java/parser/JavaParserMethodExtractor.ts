import {JavaParserHelper} from "./JavaParserHelper";
import {ClassOrInterfaceTypeContext, MethodParameterTypeContext, MethodTypeContext} from "./../../../ParsedAstTypes";
import {JavaAntlr4CstPrinter} from "../util/JavaAntlr4CstPrinter";
import {JavaParserFieldAndParameterTypeExtractor} from "./JavaParserFieldAndParameterTypeExtractor";

export class JavaParserMethodExtractor {
    public output: MethodTypeContext;
    public classOrInterface: ClassOrInterfaceTypeContext;
    public currentVisibleClassOrInterface: any;
    public includePosition: boolean;
    constructor(classOrInterface: ClassOrInterfaceTypeContext, currentVisibleClassOrInterface: any, ctx, modifierCtx, includePosition: boolean) {
        this.includePosition = includePosition;
        this.classOrInterface = classOrInterface;
        this.currentVisibleClassOrInterface = currentVisibleClassOrInterface;
        this.output = this.enterMethodDeclaration(ctx, modifierCtx);
    }

    custom_getFormalParameter(ctx, method: MethodTypeContext){
        /**
         "type": "formalParameter",
         "node": "FormalParameterContext",
         "children": [
         {
                  "type": "typeType",
                  "node": "TypeTypeContext",
                  "children": [
                    {
                      "type": "classOrInterfaceType",
                      "node": "ClassOrInterfaceTypeContext",
                      "children": [
                        {
                          "type": "typeIdentifier",
                          "node": "TypeIdentifierContext",
                          "children": [
                            "List"
         */
        //JavaAntlr4CstPrinter.print(ctx, "methodParameter");

        let typeType = JavaParserHelper.getChildByType(ctx, "typeType");

        let modifiers = JavaParserHelper.getModifiers(ctx);

        let type = JavaParserFieldAndParameterTypeExtractor.custom_getFieldType(typeType, ctx, this.currentVisibleClassOrInterface);

        let variableDeclaratorId = JavaParserHelper.getChildByType(ctx, "variableDeclaratorId");
        let variableIdentifier = JavaParserHelper.getChildByType(variableDeclaratorId, "identifier");
        let variableName = variableIdentifier.getText(); // get the name of the variable

        let ignore = false; // TODO: check if in java we should ignore some parameters, like for fields: serialVersionUID

        let parameter: MethodParameterTypeContext = new MethodParameterTypeContext(variableName, variableName, type, modifiers, ignore, method);

        if(this.includePosition){
            let parameterPosition = JavaParserHelper.custom_getPosition(variableDeclaratorId);
            // Somehow the position is not correct for the parameter name, so we fix it here
            // we get the correct start column for the parameter
            // but the end column is not correct, so we add the length of the parameter name
            parameterPosition.endColumn = parameterPosition.startColumn + variableName.length;
            parameterPosition.endLine = parameterPosition.startLine; // since the end of the declaration might be on the next line, we set it to the same line but we want the end of the variable name

            parameter.position = parameterPosition;


        }

        return parameter;
    }

    custom_getFormalParameters(ctx, method: MethodTypeContext){
        /**
         "type": "formalParameters",
         "node": "FormalParametersContext",
         "children": [
         "(",
         {
          "type": "formalParameterList",
          "node": "FormalParameterListContext",
         */
        let parameters: MethodParameterTypeContext[] = [];
        if(ctx.children.length>=3){ // has parameters: [ "(", formalParameterList, ")" ]
            let formalParameterList = ctx.children[1];
            for(let i = 0; i < formalParameterList.children.length; i++){
                let formalParameter = formalParameterList.children[i];
                if(formalParameter.getText()===","){
                    // skip
                } else {
                    let parameter = this.custom_getFormalParameter(formalParameter, method);
                    // @ts-ignore
                    parameters.push(parameter);
                }
            }
        }
        return parameters;
    }


    enterMethodDeclaration(ctx, modifierCtx) {
        //JavaAntlr4CstPrinter.print(modifierCtx, "method modifierCtx");
        //JavaAntlr4CstPrinter.print(ctx, "methodDeclaration");

        let hasOverrideAnnotation = JavaParserHelper.hasMethodOverrideAnnotationFromModifierCtx(modifierCtx);

        // get visibility from parent
        let modifiers = JavaParserHelper.getModifiers(modifierCtx);
        //method["position"] = custom_getPosition(ctx.parentCtx.parentCtx);

        // get method name
        let methodName = ctx.children[1].getText();

        let formalParameters = ctx.children[2];

        // create an empty method, so that we can use it to get parameters
        let methodPlaceholder: MethodTypeContext = new MethodTypeContext("", methodName, "method", hasOverrideAnnotation, this.classOrInterface);
        // lets get the parameters but with incorrect methodplaceholder
        let parametersPlaceholder = this.custom_getFormalParameters(formalParameters, methodPlaceholder);

        // lets get the correct method signature from the names of the parameters
        let methodSignature = methodName + "("+parametersPlaceholder.map(p=>p.name).join(",")+")";
        // create the correct method
        let method: MethodTypeContext = new MethodTypeContext(methodSignature, methodName, "method", hasOverrideAnnotation, this.classOrInterface);
        method.modifiers = modifiers;
        // create the correct parameters
        let parameters = this.custom_getFormalParameters(formalParameters, method);
        // get return type
        // TODO: this is not correct way to get return type:
        let returnType = ctx.children[0].getText(); // Example: public void int method()[] {return new int[0];} is returning an array
        method.returnType = returnType;
        // get visibility

        method.parameters = parameters;

        if(this.includePosition){
            method.position = JavaParserHelper.custom_getPosition(ctx);
        }

        let methodBody = JavaParserHelper.getChildByType(ctx, "methodBody");
        if(!!methodBody){
            // TODO Support anonymous classes: https://docs.oracle.com/javase/tutorial/java/javaOO/anonymousclasses.html#:~:text=Anonymous%20classes%20enable%20you%20to,a%20local%20class%20only%20once.

            let innerDefinedClasses = JavaParserHelper.getListOfOfInnerChildrenOnTopLayer(methodBody, "classDeclaration");
            if(innerDefinedClasses.length > 0){
                console.log("Found anonymous classes: "+innerDefinedClasses.length)
                console.log(innerDefinedClasses)
            }
            let innerDefinedInterfaces = JavaParserHelper.getListOfOfInnerChildrenOnTopLayer(methodBody, "interfaceDeclaration");
            if(innerDefinedInterfaces.length > 0){
                console.log("Found innerDefinedInterfaces: "+innerDefinedInterfaces.length)
                console.log(innerDefinedInterfaces);
            }
        }



        // @ts-ignore

        return method;
    }
}
