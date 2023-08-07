import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkDemoStack } from '../lib/cdk-demo-stack';
import { devParameter, prodParameter } from '../parameter'

const app = new cdk.App();
new CdkDemoStack(app, 'DevStack', {
  envName: devParameter.envName,
  branchName: devParameter.branchName
});

new CdkDemoStack(app, 'ProdStack', {
  envName: prodParameter.envName,
  branchName: prodParameter.branchName
});
