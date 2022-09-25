import json
import os
from pathlib import Path
import sys

import boto3

STATEMACHINE_NAME = sys.argv[1]
DEFINITION_FILE = 'asl.json'
REGION_NAME = 'ap-northeast-1'

directory_path = os.path.abspath(os.path.join(os.path.abspath(__file__), os.pardir))
definition_path = os.path.join(directory_path, DEFINITION_FILE)

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
        definition = read_file(definition_path),
        roleArn = 'arn:aws:iam::123456789012:role/service-role/DummyRole',
    )

if __name__ == '__main__':
  main()
