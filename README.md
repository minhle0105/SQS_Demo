# ETL off a SQS queue - Implemented with Node.js

## How to run the applications:

1. Prerequisites:
- Node.js
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
Responses to questions:

- How would you deploy this application in production?
- What other components would you want to add to make this production ready?
- How can this application scale with a growing dataset.
- How can PII be recovered later on?
- What are the assumptions you made?