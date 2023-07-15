import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import * as codePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codePipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ScopedAws } from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";



export interface scrapingLambdaFunctionProps {

}

export class scrapingLambdaFunction extends Construct {
    constructor(scope: Construct, id: string, props: scrapingLambdaFunctionProps) {
        super(scope, id);

        new Function(this, "pythonFunction", {
            functionName: "library-scraping",
            runtime: Runtime.PYTHON_3_9,
            code: Code.fromAsset("lambda"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(30)
        });

    }
}
