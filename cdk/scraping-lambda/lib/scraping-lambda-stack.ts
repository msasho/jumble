import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Cicd } from './constructs/cicd';
import { Ci } from './constructs/ci';
import { scrapingLambdaFunction } from './constructs/lambda';

export class ScrapingLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const cicd = new Cicd(this, 'pipeline', {
    //   projectName: "library-scraping",
    //   stageName: "string",
    //   githubOwnerName: "masawai",
    //   githubRepositoryName: "jumble",
    //   githubBranchName: "main",
    //   codestarConnectionArn: "arn:aws:codestar-connections:ap-northeast-1:155385059623:connection/27dcce34-38ec-4039-b546-d2b230497900",
    // });

    const ci = new Ci(this, 'ci', {
      repositoryName: "jumble",
      githubOwnerName: "masawai",
    });

    const lambda = new scrapingLambdaFunction(this, 'scrapingLambdaFunction', {})
  }
}
