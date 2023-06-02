import * as cdk from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as stepfunctions_tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class StepfunctionsDemoStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const success = this.defineSuccessState('success');
    const failure = this.defineFailureState('Fail');
    const waitTask = this.defineWaitState('wait');

    const childStateMachine1 = this.defineChildStateMachine('childStateMachine1', success);
    const childStateMachine2 = this.defineChildStateMachine('childStateMachine2', failure);

    const task1 = this.defineChildTask('childTask1', childStateMachine1);
    const task2 = this.defineChildTask('childTask2', childStateMachine2);

    const catchErrorState1 = this.defineCatchErrorState('catchErrorState1', 'task1');
    const catchErrorState2 = this.defineCatchErrorState('catchErrorState2', 'task2');

    const parallel = this.defineParallelState('All jobs', [task1, catchErrorState1], [task2, catchErrorState2]);

    const getResult = this.defineGetResultState('getResults');
    const parentSuccess = this.defineSuccessState('parentSuccess');
    const parentFailure = this.defineFailureState('parentFailure');
    const checkResult = this.defineChoiceState('checkResult', parentFailure, parentSuccess);

    this.defineParentStateMachine('parentStateMachine', waitTask, parallel, getResult, checkResult);
  }

  private defineSuccessState(id: string) {
    return new stepfunctions.Succeed(this, id);
  }

  private defineFailureState(id: string) {
    return new stepfunctions.Fail(this, id, {
      error: 'WorkflowFailure',
      cause: "Something went wrong",
    });
  }

  private defineWaitState(id: string) {
    return new stepfunctions.Wait(this, id, {
      time: stepfunctions.WaitTime.timestampPath('$.waitSeconds'),
    });
  }

  private defineChildStateMachine(id: string, definition: stepfunctions.IChainable) {
    return new stepfunctions.StateMachine(this, id, {
      stateMachineName: id,
      definition: definition,
    });
  }

  private defineChildTask(id: string, stateMachine: stepfunctions.IStateMachine) {
    return new stepfunctions_tasks.StepFunctionsStartExecution(this, id, {
      stateMachine: stateMachine,
      integrationPattern: stepfunctions.IntegrationPattern.RUN_JOB,
      input: stepfunctions.TaskInput.fromObject({
        token: stepfunctions.JsonPath.taskToken,
        foo: 'bar',
      }),
    });
  }

  private defineCatchErrorState(id: string, error: string) {
    return new stepfunctions.Pass(this, id, {
      result: stepfunctions.Result.fromObject({ error: error }),
    });
  }

  private defineParallelState(id: string, task1: [stepfunctions.TaskStateBase, stepfunctions.IChainable], task2: [stepfunctions.TaskStateBase, stepfunctions.IChainable]) {
    return new stepfunctions.Parallel(this, id)
      .branch(task1[0].addCatch(task1[1], { errors: ['States.ALL'] }))
      .branch(task2[0].addCatch(task2[1], { errors: ['States.ALL'] }));
  }

  private defineGetResultState(id: string) {
    return new stepfunctions.Pass(this, id, {
      parameters: { 'result.$': 'States.JsonToString($)' }
    });
  }

  private defineChoiceState(id: string, failureState: stepfunctions.IChainable, successState: stepfunctions.IChainable) {
    return new stepfunctions.Choice(this, id)
      .when(stepfunctions.Condition.stringMatches('$.result', '*error*'), failureState)
      .otherwise(successState);
  }

  private defineParentStateMachine(id: string, waitState: stepfunctions.INextable, parallelState: stepfunctions.IChainable, getResultState: stepfunctions.IChainable, choiceState: stepfunctions.IChainable) {
    return new stepfunctions.StateMachine(this, id, {
      stateMachineName: id,
      definition: waitState.next(parallelState).next(getResultState).next(choiceState)
    });
  }
}
