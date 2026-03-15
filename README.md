# Law Firm Management System

A comprehensive law firm management system built with Spring Boot backend, Angular frontend, and MySQL database.

## Features

- **User Management**: Role-based access control for Admin, Lawyers, and Clients
- **Case Management**: Track and manage legal cases with status updates
- **Document Management**: Upload and organize legal documents
- **Messaging System**: Secure communication between lawyers and clients
- **Dashboard**: Analytics and overview for different user roles
- **Three.js Landing Page**: Interactive 3D animation on the landing page

## Technology Stack

### Backend (Spring Boot)
- Java 17
- Spring Boot 3.2.0
- Spring Security with JWT authentication
- Spring Data JPA
- MySQL 8.0
- Maven

### Frontend (Angular)
- Angular 17
- Angular Material
- Three.js for 3D animations
- TypeScript
- SCSS for styling

### Database
- MySQL 8.0
- Username: root
- Password: 123456

## Project Structure

```
law-firm-management-system/
├── backend/
│   ├── src/main/java/com/lawfirm/
│   │   ├── entity/          # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── service/         # Business logic
│   │   ├── controller/      # REST controllers
│   │   ├── security/        # JWT and security configuration
│   │   ├── dto/            # Data transfer objects
│   │   └── config/         # Application configuration
│   └── pom.xml
└── frontend/
    ├── src/app/
    │   ├── shared/         # Shared components and services
    │   ├── auth/           # Authentication components
    │   ├── admin/          # Admin dashboard
    │   ├── lawyer/         # Lawyer interface
    │   ├── client/         # Client interface
    │   └── landing/        # Landing page with Three.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE law_firm_db;
```

2. Update database credentials in `backend/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/law_firm_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
ng serve
```

The frontend will start on `http://localhost:4200`

## Default Admin User

The system automatically creates a default admin user:
- **Username**: admin
- **Password**: admin123
- **Role**: Administrator

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate` - Token validation

### Users
- `GET /api/admin/users` - Get all users (Admin only)
- `POST /api/admin/users` - Create user (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Cases
- `GET /api/cases` - Get user cases
- `POST /api/cases` - Create new case
- `GET /api/cases/{id}` - Get case by ID
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case

### Documents
- `GET /api/documents` - Get documents
- `POST /api/documents` - Upload document
- `GET /api/documents/{id}` - Download document
- `DELETE /api/documents/{id}` - Delete document

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/{id}/read` - Mark message as read

## User Roles and Permissions

### Admin
- Manage all users
- View all cases
- System analytics
- User role assignment

### Lawyer
- Manage assigned cases
- Communicate with clients
- Upload documents
- View case history

### Client
- View own cases
- Communicate with lawyers
- Access shared documents
- View case updates

## Development

### Running Tests

Backend tests:
```bash
cd backend
mvn test
```

Frontend tests:
```bash
cd frontend
ng test
```

### Building for Production

Backend:
```bash
cd backend
mvn clean package
```

Frontend:
```bash
cd frontend
ng build --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
