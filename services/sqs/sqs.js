const aws = require('aws-sdk');

// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath('../../config.js');

// Instantiate SQS.
const sqs = new aws.SQS();

class SQS {
    sendMessage(message,queueUrl) {
        const params = {
            MessageBody: message,
            QueueUrl: queueUrl,
            DelaySeconds: 0
        };
        sqs.sendMessage(params, (err, data) => {
            if(err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
    }
}