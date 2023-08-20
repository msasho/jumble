// TODO: 現状のままだと動かないため、修正が必要
import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ScopedAws } from 'aws-cdk-lib';


export interface CiProps extends StackProps {
    repositoryName: string;
    githubOwnerName: string;
}

export class Ci extends Construct {
    constructor(
        scope: Construct,
        id: string,
        props: CiProps
    ) {
        super(scope, id);

        const {
            repositoryName,
            githubOwnerName,
        } = props;
        const { accountId, region } = new ScopedAws(this);

        // codeBuild
        const gitHubSource = codeBuild.Source.gitHub({
            owner: githubOwnerName,
            repo: repositoryName,
            webhook: true,
            webhookFilters: [
                codeBuild.FilterGroup
                    .inEventOf(codeBuild.EventAction.PULL_REQUEST_CREATED, codeBuild.EventAction.PULL_REQUEST_REOPENED)
            ],
        });

        let snyk_build_project = new codeBuild.Project(this, 'snykBuild', {
            source: gitHubSource,
            buildSpec: codeBuild.BuildSpec.fromObject({
                "version": "0.2",
                "env": {
                    "parameter-store": {
                        "SNYK_ORG": "snyk-org-id",
                        "SNYK_TOKEN": "snyk-auth-code",
                    }
                },
                "phases": {
                    "install": {
                        "commands": [
                            "echo 'installing dependencies'",
                            "pip install -r ./cdk/scraping-lambda/lambda/requirements.txt"
                        ]
                    },
                    // "pre_build": {
                    //     "commands": [
                    //         "echo 'authorizing Snyk'",
                    //         "snyk config set api=$SNYK_TOKEN"
                    //     ]
                    // },
                    "build": {
                        "steps": [
                            {
                                "name": "Run Snyk to check for vulnerabilities",
                                "uses": "snyk/actions/python-3.8@master",
                                "env": {
                                    "SNYK_TOKEN": "${SNYK_TOKEN}"
                                },
                                "with":
                                    { "args": "--severity-threshold=critical" },
                            },
                        ]
                    },
                    "post_build": {
                        "commands": [
                            "echo ***build complete****"
                        ]
                    }
                }
            }),
            environment: {
                buildImage: codeBuild.LinuxBuildImage.STANDARD_5_0,
                computeType: codeBuild.ComputeType.SMALL,
                privileged: true
            }
        });

        snyk_build_project.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ssm:GetParameters'],
            effect: iam.Effect.ALLOW,
            resources: [
                `arn:aws:ssm:${region}:${accountId}:parameter/snyk-org-id`,
                `arn:aws:ssm:${region}:${accountId}:parameter/snyk-auth-code`
            ]
        }));
    }
}
