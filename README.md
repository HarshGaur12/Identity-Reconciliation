# Emotorad Backend Task: Identity Reconciliation

## Overview
This project implements an `/identify` API endpoint that consolidates contact information based on email and phone numbers. The system links different orders made by the same user, even if they use different contact details.

---
## Features
✅ Accepts `email` and `phoneNumber` as input.  
✅ Consolidates contacts into primary and secondary relationships.  
✅ Automatically updates existing contacts when new details match.  
✅ Uses MySQL for data storage.  
✅ Well-structured, scalable backend using Node.js and Express.  

---

## Tech Stack
- **Backend**: Node.js, Express.js  
- **Database**: MySQL  
- **ORM/Querying**: MySQL2  
- **Environment Management**: dotenv  

---

## Installation & Setup

### 1. Clone the Repository
```sh
git clone https://github.com/HarshGaur12/Identity-Reconciliation.git
cd Identity Reconciliation
```
### 2. Install Dependencies
```sh
npm install
```
### 3.  Set Up the Database
#### Create the database manually:
```sh
CREATE DATABASE emotorad_db;
```
#### Create the contacts table:
```sh
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(15) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    linkedId INT DEFAULT NULL, -- Links secondary contacts to primary contacts
    linkPrecedence ENUM('primary', 'secondary') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);

```

### 4. Start the Server
```sh
npm run dev
```
#### The server will run on http://localhost:3000/api/identify.

---


# API Documentation

## 1. `/identify` Endpoint
### URL:
`POST /identify`

### Request Body (JSON):
```json
{
  "email": "harsh@gmail.com",
  "phoneNumber": "7649675849"
}
```

## Response (JSON Example)
```json
{
  "primaryContactId": 1,
  "emails": ["harsh@gmail.com", "newemail@gmail.com"],
  "phoneNumbers": ["7649675849", "9876543210"],
  "secondaryContactIds": [2, 3]
}
```

## 2. `/check-contacts` Endpoint

### URL:
`GET /check-contacts`

### Description:
This endpoint retrieves all contact entries from the database.

### SQL Query to Verify Database Entries:
```sql
SELECT * FROM contacts;
