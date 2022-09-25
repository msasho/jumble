import json
import sys

import boto3

STATEMACHINE_NAME = sys.argv[1]
DEFINITION_PATH = './asl.json'
REGION_NAME = 'ap-northeast-1'

stepfunctions = boto3.client(
        service_name = 'stepfunctions',
        endpoint_url='http://localhost:8083',
        region_name=REGION_NAME,
        )

def read_file(path):
    with open(path) as f:
        content = f.read()
    return content

def main():
    response = stepfunctions.create_state_machine(
        name = STATEMACHINE_NAME,
        definition = read_file(DEFINITION_PATH),
        roleArn = 'arn:aws:iam::123456789012:role/service-role/DummyRole',
    )

if __name__ == '__main__':
  main()
