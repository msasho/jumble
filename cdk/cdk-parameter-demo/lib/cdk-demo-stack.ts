import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export interface stackProps extends cdk.StackProps {
  envName: string;
  branchName: string;
}

export class CdkDemoStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: stackProps
  ) {
    super(scope, id, props);

    const {
      envName,
      branchName,
    } = props;

    // codebuild
    const gitHubSource = codebuild.Source.gitHub({
      owner: 'masawai',
      repo: 'jumble',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup
          .inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED, codebuild.EventAction.PULL_REQUEST_REOPENED)
          .andBaseBranchIs(branchName)
      ],
    });

    const buildProject = new codebuild.Project(this, 'buildProject', {
      source: gitHubSource,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              python: "3.8"
            },
          },
          build: {
            commands: [
              'echo test',
            ]
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        environmentVariables: {
          ENV: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: envName,
          }
        },
      }
    });

  }
}
