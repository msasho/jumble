import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';


export interface scrapingLambdaFunctionProps {

}

export class scrapingLambdaFunction extends Construct {
    constructor(scope: Construct, id: string, props: scrapingLambdaFunctionProps) {
        super(scope, id);

        new PythonFunction(this, "pythonFunction", {
            functionName: "library-scraping",
            runtime: Runtime.PYTHON_3_9,
            index: "lambda_function.py",
            handler: "lambda_handler",
            timeout: Duration.seconds(60),
            entry: "./lambda",
        });
    }
}
