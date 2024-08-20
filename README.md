# Adopting pets backend

## Overview

This project is a server side web application that manages customers, pets, and authentication processes. It utilizes several key features, including user authentication, customer and pet management, and file uploads with Cloudinary.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

Clone the repository:

```bash
git clone https://github.com/MOHAMED200177/backend-pet-v1.git
cd backend-pet-v1
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory and add the following environment variables:

```plaintext
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
NODE_ENV=development
```

Start the application:

```bash
npm start
```

## Usage

### Authentication

- Signup: Users can sign up by providing their name, email, password, and password confirmation. A JWT token is generated and sent to the client.

- Login: Users can log in using their email and password. If the credentials are correct, a JWT token is generated and sent to the client.

- Protecting Routes: Routes can be protected by requiring a valid JWT token. Users must be logged in to access these routes.

### Customer Management

- Update Profile: Customers can update their profile information, such as name and email.

- Deactivate Account: Customers can deactivate their account, which sets the active field to false.

### Pet Management

- Create Pet: Users can create a new pet by providing details such as name, age, breed, description, and more. Multiple images can be uploaded for each pet using Cloudinary.

- Get All Pets: Retrieve a list of all pets with filtering, sorting, field limiting, and pagination.

- Get Pet by ID: Retrieve details of a specific pet by its ID.

## Configuration

### Cloudinary

The `config/cloudinaryConfig.js` file is responsible for configuring Cloudinary, a cloud-based image and video management service. Ensure that your Cloudinary credentials are set correctly in the `.env` file.

### Authentication

The `controllers/authController.js` file manages the authentication flow, including signup, login, protecting routes, and resetting passwords. JWT tokens are used for authentication.

### Customer Management

The `controllers/CustomerController.js` file manages customer-related operations such as updating and deleting customer profiles.

### Pet Management

The `controllers/petController.js` file manages pet-related operations such as creating, retrieving, and filtering pets.

## API Endpoints

### Authentication

- `POST /api/v1/customers/signup`: Sign up a new customer.
- `POST /api/v1/customers/login`: Log in a customer.
- `POST /api/v1/customers/forgotPassword`: Send a password reset email.
- `PATCH /api/v1/customers/resetPassword/:token`: Reset password using a token.

### Customer Management

- `PATCH /api/v1/customers/updateMe`: Update customer profile.
- `DELETE /api/v1/customers/deleteMe`: Deactivate customer account.
- `GET /api/v1/customers`: Get all customers (admin only).

### Pet Management

- `POST /api/v1/pets`: Create a new pet.
- `GET /api/v1/pets`: Get all pets with filtering, sorting, and pagination.
- `GET /api/v1/pets/:id`: Get a specific pet by ID.

## License

This project is licensed under the MIT License.
