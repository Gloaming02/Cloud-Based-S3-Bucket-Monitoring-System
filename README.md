# Welcome to your CDK TypeScript project

## System design
![image](https://github.com/user-attachments/assets/6401e3c1-d9f8-4ff8-9c74-6577883d2e28)

# Cloud-Based S3 Bucket Monitoring System

This project extends the functionality of a previous S3-based object monitoring system by introducing a **fanout pattern** with **SNS**, **SQS**, **multiple Lambda functions**, and **CloudWatch metrics/alarms** to automate bucket size management.

## 🛠 Project Description
This system automatically monitors object creation and deletion in an S3 bucket (`TestBucket`) and triggers a cleaner Lambda to remove the largest object when the total size exceeds a predefined threshold.

## ✨ Features

- **Fanout Architecture**: Uses an SNS topic and multiple SQS queues to distribute S3 events to Lambda consumers.
- **Size Tracking Lambda**: Updates a DynamoDB table with object size information upon creation or deletion.
- **Logging Lambda**: Logs structured JSON messages (with size delta) to CloudWatch.
- **CloudWatch Metric Filters & Alarms**: Extracts `size_delta` from logs to compute total bucket size; triggers an alarm if the total exceeds 20 bytes.
- **Cleaner Lambda**: Deletes the largest object upon alarm.
- **Plotting Lambda**: Called by the driver to visualize the bucket size history.

## 🧩 Components

| Component          | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| `Driver Lambda`   | Creates/deletes test objects and invokes plotting Lambda                    |
| `S3 Bucket`       | Triggers SNS on object creation/deletion                                    |
| `SNS Topic`       | Fanout to two SQS queues                                                    |
| `SQS Queues`      | Buffer events for size-tracking and logging Lambdas                         |
| `Size Lambda`     | Updates object size in DynamoDB                                             |
| `Logging Lambda`  | Logs size changes to CloudWatch in JSON                                     |
| `CloudWatch`      | Metric filter + alarm triggers Cleaner Lambda                               |
| `Cleaner Lambda`  | Deletes largest object when alarm is triggered                              |
| `DynamoDB`        | Stores object names, sizes, and timestamps                                  |

## 🏗 Infrastructure as Code

All AWS resources were created and managed using the **AWS CDK (TypeScript)**.

Benefits:
- Reproducible and version-controlled deployments
- ~80% time reduction in setup/configuration

## 🧪 How It Works (Example Flow)

1. `driver lambda` uploads:
   - `assignment1.txt` ("Empty Assignment 1") → 19 bytes  
   - `assignment2.txt` ("Empty Assignment 2222222222") → 28 bytes  
     → Total = 47 → **Alarm triggers**, `assignment2.txt` deleted  
   - `assignment3.txt` ("33") → 2 bytes  
     → Total = 21 → **Alarm triggers**, `assignment1.txt` deleted  

2. `logging lambda` logs all changes in:
   ```json
   {"object_name": "assignment2.txt", "size_delta": 28}
   {"object_name": "assignment2.txt", "size_delta": -28}


This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

