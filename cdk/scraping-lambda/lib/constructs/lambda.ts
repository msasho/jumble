import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';


export interface scrapingLambdaFunctionProps {

}

export class scrapingLambdaFunction extends Construct {
    constructor(scope: Construct, id: string, props: scrapingLambdaFunctionProps) {
        super(scope, id);

        // const seleniumLayer = LayerVersion.fromLayerVersionAttributes(this, 'seleniumLayer', {
        //     layerVersionArn: 'arn:aws:lambda:ap-northeast-1:155385059623:layer:selenium-layer:1',
        //     compatibleRuntimes: [Runtime.PYTHON_3_10],
        // });
        const headlessLayer = LayerVersion.fromLayerVersionAttributes(this, 'headlessLayer', {
            layerVersionArn: 'arn:aws:lambda:ap-northeast-1:155385059623:layer:headless-layer:4',
            compatibleRuntimes: [Runtime.PYTHON_3_7], // seleniumを動作させるために3.7にした
        });

        new PythonFunction(this, "pythonFunction", {
            functionName: "library-scraping",
            runtime: Runtime.PYTHON_3_7, // seleniumを動作させるために3.7にした
            index: "lambda_function.py",
            handler: "lambda_handler",
            timeout: Duration.seconds(10),
            entry: "./lambda",
            layers: [headlessLayer],
        });
        // const myFunction = new Function(this, 'MyFunction', {
        //     code: Code.fromAsset('./lambda'),
        //     handler: 'lambda_function.lambda_handler',
        //     runtime: Runtime.PYTHON_3_10,
        //     layers: [seleniumLayer, headlessLayer],
        // });
    }
}
