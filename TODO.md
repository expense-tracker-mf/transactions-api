# Transactions API

## Endpoints

- GET /transactions - Get all transactions
- POST /transactions - Create a new transaction
- GET /transactions/:id - Get a specific transaction
- DELETE /transactions/:id - Delete a specific transaction

## Classes

- TransactionManager
- UserManager

## Database

### Transaction

- id (Primary Key)
- user_id (Foreign Key)
- amount
- description (optional)
- category
- date (default: current timestamp)

### User

- id (Primary Key)
- name
- password_hash
