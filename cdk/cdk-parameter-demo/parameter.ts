import { Environment } from 'aws-cdk-lib';

export interface MyParameter {
    env?: Environment;
    envName: string;
    branchName: string;
}

export const devParameter: MyParameter = {
    envName: 'dev',
    branchName: 'develop',
}

export const prodParameter: MyParameter = {
    envName: 'prod',
    branchName: 'production',
}
