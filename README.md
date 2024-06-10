# ETL off a SQS queue - Implemented with Node.js

## How to run the applications:

1. Prerequisites:
- Node.js (see installation guide [here](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs))
- Docker (see installation guide [here](https://docs.docker.com/get-docker/))
- Docker Compose (see installation guide [here](https://docs.docker.com/compose/install/))
- AWS CLI (see installation guide [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- PostgreSQL (see installation guide [here](https://www.postgresql.org/docs/current/tutorial-install.html))

2. Steps to run
- Clone the repository:
```bash
git clone https://github.com/minhle0105/SQS_Demo/tree/main
cd SQS_Demo
```

- Run Docker Compose commands to build container
```bash
docker-compose up -d
```

- Now move to the application folder and install all dependencies
```bash
cd node_app
npm install
```

- (Optional) If you wish to use your custom PostgreSQL credentials, then create a .env file and set up the following environment variables. Otherwise, these are already defined and will be used to run as default.
```bash
QUEUE_URL=YOUR_QUEUE_URL
DB_NAME=YOUR_DB_NAME
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_HOST=YOUR_DB_HOST
DB_PORT=YOUR_DB_PORT
```

- Enable PostgreSQL on your machine and create the necessary table with the following query (make sure it's created in the correct database name ('postgres' by default)):
```sql
CREATE TABLE IF NOT EXISTS user_logins(
user_id varchar(128),
device_type varchar(32),
masked_ip varchar(256),
masked_device_id varchar(256),
locale varchar(32),
app_version integer,
create_date date
);
```

- Run the application:
```bash
node etl.js
```
3. Thought process:


Below is my thought process that builds up my approach. After setting up all the dependencies and requirements, I started by having a `main` function. In this `main` function, first of all, I needed to send a request to receive message, because that is the primary purpose of this application. This was done with using sqs instance calling to `ReceiveMessageCommand`. Upon receiving the response, I checked if the response contains the message, in which case I would go ahead and process it (flatten JSON) and write to database. After the record was successfully written to database, it was time to delete the message from the queue, which was achieved with sqs calling `DeleteMessageCommand`.

Up until here, everything is as-required, step by step. However, I realized multiple spots need to be handled synchronously. In Node.js, there are different approaches to handle this, and I chose to use async/await. Basically, I had to make sure to wait until I received the message before proceeding. I also had to make sure to wait until the processed record was successfully written to the database, before I moved on to deleting the message. Finally, I had to make sure to wait until the message was successfully deleted from the queue before I could end the process. In order for all of these to execute as expected, I also made sure to declare `main` as an async function.

Regarding the steps of masking PII, I was not quite sure of the security requirements, so I decided to go for the SHA-256 encryption algorithm.

4. Responses to questions:
- *How would you deploy this application in production?
    -
- What other components would you want to add to make this production ready?
- How can this application scale with a growing dataset.
- How can PII be recovered later on?
- What are the assumptions you made?