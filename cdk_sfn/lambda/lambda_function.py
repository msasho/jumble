import boto3

def update_cloudfront_distribution(event):
    try:
        distribution_id = event["distribution_id"]
        new_acl_id = event["new_acl_id"]
    except KeyError as e:
        return {"statusCode": 400, "body": f"Missing key in event: {e}"}

    client = boto3.client("cloudfront")

    try:
        dist_config_response = client.get_distribution_config(Id=distribution_id)
        dist_config = dist_config_response["DistributionConfig"]
        e_tag = dist_config_response["ETag"]

        dist_config["WebACLId"] = new_acl_id

        client.update_distribution(Id=distribution_id, IfMatch=e_tag, DistributionConfig=dist_config)
    except Exception as e:
        return {"statusCode": 500, "body": f"Failed to update distribution config: {e}"}

    return {"statusCode": 200, "body": f"Updated WAF ACL for distribution {distribution_id} to {new_acl_id}"}

def lambda_handler(event, context):
    print(event)
    response = update_cloudfront_distribution(event)
    return response
