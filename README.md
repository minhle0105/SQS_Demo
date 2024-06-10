# ETL off a SQS queue - Implemented with Node.js

## How to run the applications:

1. Prerequisites:
- Node.js (see installation guide here [https://nodejs.org/en/learn/getting-started/how-to-install-nodejs])
- Docker
- Docker Compose
- AWS CLI
- PostgreSQL

2. Steps
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
Responses to questions:

- How would you deploy this application in production?
- What other components would you want to add to make this production ready?
- How can this application scale with a growing dataset.
- How can PII be recovered later on?
- What are the assumptions you made?