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
git clone https://github.com/minhle0105/SQS_Demo.git
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
- *How would you deploy this application in production?*
    - There would be 5 main steps needed to deploy this application. Given that the context of this application is mainly related to AWS, I will align my response to AWS as much as I can.
    - The first step is to use Docker to containerize the application, and Kuburnetes for container orchestration to achieve reliable deployment.
    - Next step is to deploy the application on AWS. Here, I would choose to deploy it on an (or multiple, depends on specific contexts) EC2 instance(s).
    - Next step is to setup automated testing, building, and deployment infrastrucuture (CI/CD). This depends on the specific requirements, which are not mentioned in this project.
    - Last step would be database configuration. I believe AWS RDS has an engione option which works with PostgreSQL, which will be suitable for this application.
- *What other components would you want to add to make this production ready?*
    There are main additional functionalities I want to add, which will require two components.
    - First, I want to add backup/recovery capabilities to the application. This is important in production. To achieve this, there are options to set automated backups in AWS RDS I believe I can use.
    - Second, I want to add scalabilitiy to the application. There are two main things I want to focus on here: auto scaling and load balancer. The first one can be achieved when configuring the EC2 instances in which we deploy the application, and the second one can be added with AWS ELB.
- *How can this application scale with a growing dataset?*
    - One of the most common ways is to use horizontal scaling. With Load balancer implemeted from the previous question, we can initialize more instances behind it. These instances, when added, will unavoidably increase the complexity of the system. This can be handled with using Kuburnetes to manage the instances more easily.
    - Another common approach is to focus on scaling the database. Given that the nature of this application only involves writing to the database, I think one way to go here is to use database partitioning, which in the future, when we implemet read-queries, it will be faster.
- *How can PII be recovered later on?*
    - One of the first things I come up with is to implement strict access control policies. This is necessary to protect all kinds of data, not only PII. There are multiple access control models we can explore, including but not limited to RBAC, ABAC or PBAC. From my experience, RBAC is my most favorite approach, and I think it will be a good option in this context, as being able to view sensitive data is more likely to be determined by the role of an user in the system.
    - Another thing I think of is to separate PII from the other data, and use a mapping mechanism when retrieving. This way, even when the main database encounters problem, the damage on PII can be minimized since it is separated. The mapping mechanism can also employ the technique of encrypt or tokenize. Basically, we can encrypt and tokenize PII when storing them, and reverse when retrieving. This increases the level of security, so in the case of data being stolen, we make sure we are the only ones who can revert and read the actual PII.
- *What are the assumptions you made?*
    - One of the biggest assumptions I have made is about the data format. I assumed that the messages in SQS queue are always in correct and proper JSON format, which is why I processed it with JSON parse method right away.
    - Another assumption is that PII is appropriately hashed with SHA-256 algorithm, which essentially means there is no (or there is barely any) hashing collision. I think this is quite a safe assumption to make.