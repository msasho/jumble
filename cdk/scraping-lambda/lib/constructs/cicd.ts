import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import * as codePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codePipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ScopedAws } from 'aws-cdk-lib';


export interface CicdProps extends StackProps {
    projectName: string;
    stageName: string;
    githubOwnerName: string;
    githubRepositoryName: string;
    githubBranchName: string;
    codestarConnectionArn: string;
}

export class Cicd extends Construct {
    constructor(
        scope: Construct,
        id: string,
        props: CicdProps
    ) {
        super(scope, id);

        const {
            projectName,
            stageName,
            githubOwnerName,
            githubRepositoryName,
            githubBranchName,
            codestarConnectionArn,
        } = props;
        const { accountId, region } = new ScopedAws(this);

        // codebuild
        const codeBuildServiceRole = new iam.Role(this, 'CodeBuildServiceRole', {
            assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
            path: '/',
            inlinePolicies: {
                codeBuildServicePolicies: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ['cloudformation:*'],
                            resources: [
                                `arn:aws:cloudformation:${region}:${accountId}:stack/*`,
                            ],
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ['ssm:GetParameter'],
                            resources: [
                                `arn:aws:ssm:${region}:${accountId}:parameter/cdk-bootstrap/*`,
                            ],
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ['s3:*'],
                            resources: [
                                `arn:aws:s3:::cdk-*-assets-${accountId}-${region}`,
                                `arn:aws:s3:::cdk-*-assets-${accountId}-${region}/*`,
                                'arn:aws:s3:::cdktoolkit-stagingbucket-*',
                            ],
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ['iam:PassRole'],
                            resources: [
                                `arn:aws:iam::${accountId}:role/cdk-*-role-${accountId}-${region}`,
                            ],
                        }),
                    ],
                }),
            },
        });

        const codeBuildDeployProject = new codeBuild.PipelineProject(
            this,
            'CodeBuildDeployProject',
            {
                projectName: `${stageName}-${projectName}-deploy-project`,
                buildSpec: codeBuild.BuildSpec.fromSourceFilename('./cdk/scraping-lambda/buildspec.yml'),
                role: codeBuildServiceRole,
                environment: {
                    buildImage: codeBuild.LinuxBuildImage.STANDARD_5_0,
                    computeType: codeBuild.ComputeType.SMALL,
                    privileged: true,
                    environmentVariables: {
                        STAGE_NAME: {
                            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
                            value: stageName,
                        },
                    },
                },
            }
        );

        // codepipeline
        const sourceArtifact = new codePipeline.Artifact();

        const sourceAction =
            new codePipelineActions.CodeStarConnectionsSourceAction({
                actionName: 'source',
                owner: githubOwnerName,
                repo: githubRepositoryName,
                branch: githubBranchName,
                connectionArn: codestarConnectionArn,
                output: sourceArtifact,
            });

        const deployAction = new codePipelineActions.CodeBuildAction({
            actionName: 'deploy',
            project: codeBuildDeployProject,
            input: sourceArtifact,
        });

        new codePipeline.Pipeline(this, 'DeployPipeline', {
            pipelineName: `${stageName}-${projectName}-deploy-pipeline`,
            stages: [
                {
                    stageName: 'source',
                    actions: [sourceAction],
                },
                {
                    stageName: 'deploy',
                    actions: [deployAction],
                },
            ],
        });
    }
}
