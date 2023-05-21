import * as cdk from 'aws-cdk-lib';
import { ManagedPolicy, Role, IRole, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { CfnStateMachine, Pass, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import * as fs from 'fs';

const POLICY_ARN_WAF = "arn:aws:iam::aws:policy/AWSWAFFullAccess";
const POLICY_ARN_LAMBDA = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole";
const POLICY_ARN_CLOUDFRONT = "arn:aws:iam::aws:policy/CloudFrontFullAccess";

export class CdkSfnStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('environment')
    const contextValues = this.node.tryGetContext(environment)

    const stepFunctionFile = fs.readFileSync(`./stepfunctions/asl.json`)

    const lambdaRole = this.createLambdaRole();
    const lambdaFunction = this.createLambdaFunction(lambdaRole);

    const commonRole = Role.fromRoleArn(this, 'CommonRole', `arn:aws:iam::${contextValues['account']}:role/stepfunctions-common-role`);
    this.createStateMachine(stepFunctionFile, commonRole);
  }

  private createLambdaRole(): Role {
    return new Role(this, "lambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromManagedPolicyArn(this, "wafPolicy", POLICY_ARN_WAF),
        ManagedPolicy.fromManagedPolicyArn(this, "lambdaPolicy", POLICY_ARN_LAMBDA),
        ManagedPolicy.fromManagedPolicyArn(this, "cloudfrontPolicy", POLICY_ARN_CLOUDFRONT),
      ],
      description: "Basic Lambda Role",
    });
  }

  private createLambdaFunction(lambdaRole: Role): Function {
    return new Function(this, "python-function", {
      functionName: "switch_acl",
      runtime: Runtime.PYTHON_3_9,
      code: Code.fromAsset("lambda"),
      handler: "lambda_function.lambda_handler",
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30)
    });
  }

  private createStateMachine(stepFunctionFile: Buffer, commonRole: IRole): StateMachine {
    const stateMachine = new StateMachine(this, 'MyStateMachine', {
      definition: new Pass(this, 'StartState'),
      role: commonRole,
      stateMachineName: "SwitchWafAcl"
    });

    const cfnStateMachine = stateMachine.node.defaultChild as CfnStateMachine;
    cfnStateMachine.definitionString = stepFunctionFile.toString();
    return stateMachine;
  }
}
