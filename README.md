# RenewMart - Renewable Energy Land Investment Platform

RenewMart is a comprehensive web application that connects landowners with renewable energy investors, facilitating sustainable energy project development through an intuitive platform.

## 🌟 Features

### For Landowners
- **Land Registration**: Register and manage land properties for renewable energy projects
- **Document Management**: Upload and manage land documents, certificates, and legal papers
- **Project Tracking**: Monitor the progress of renewable energy projects on your land
- **Revenue Management**: Track earnings from land leasing for renewable energy projects

### For Investors
- **Land Discovery**: Browse and search available land properties for renewable energy investments
- **Investment Management**: Manage investment portfolios and track project performance
- **Due Diligence**: Access land documents and perform comprehensive property analysis
- **Project Collaboration**: Communicate with landowners and project stakeholders

### For Administrators
- **User Management**: Manage landowner and investor accounts
- **Platform Oversight**: Monitor platform activities and ensure compliance
- **Analytics Dashboard**: View platform statistics and performance metrics

## 🏗️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Robust relational database for data storage
- **SQLAlchemy**: Python SQL toolkit and Object-Relational Mapping
- **JWT Authentication**: Secure user authentication and authorization
- **Uvicorn**: ASGI server for running the FastAPI application

### Frontend
- **React**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Declarative routing for React applications

## 📋 Prerequisites

- **Python 3.8+**: Required for backend development
- **Node.js 16+**: Required for frontend development
- **PostgreSQL**: Database server (local or remote)
- **Git**: Version control system

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd renewmart
   ```

2. **First-time setup**:
   ```bash
   deploy.bat
   ```
   This will:
   - Create Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Create database tables
   - Add demo users

3. **Start the application**:
   ```bash
   start-application.bat
   ```
   This will launch both backend and frontend servers.

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/renewmart
   SECRET_KEY=your-secret-key-here
   ```

5. **Create database tables**:
   ```bash
   python create_tables.py
   ```

6. **Add demo users** (optional):
   ```bash
   python add_demo_users.py
   ```

7. **Start backend server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start frontend server**:
   ```bash
   npm run dev
   ```

## 🌐 Access Points

- **Frontend Application**: http://localhost:4028
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 👥 Demo Credentials

### Landowner Account
- **Email**: john@example.com
- **Password**: password123

### Investor Account
- **Email**: jane@example.com
- **Password**: password123

### Admin Account
- **Email**: admin@renewmart.com
- **Password**: admin123

## 📁 Project Structure

```
renewmart/
├── backend/                 # FastAPI backend application
│   ├── models/             # Database models and schemas
│   ├── routers/            # API route handlers
│   ├── uploads/            # File upload storage
│   ├── main.py            # FastAPI application entry point
│   ├── database.py        # Database configuration
│   ├── auth.py            # Authentication utilities
│   └── requirements.txt   # Python dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React context providers
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── deploy.bat             # Automated deployment script
├── start-application.bat  # Application launcher script
└── README.md             # Project documentation
```

## 🔧 Development

### Backend Development

- **API Documentation**: Visit http://localhost:8000/docs for interactive API documentation
- **Database Management**: Use the provided scripts in the backend directory
- **Testing**: Run tests using `python -m pytest`

### Frontend Development

- **Hot Reload**: The development server supports hot reload for instant updates
- **Build**: Create production build using `npm run build`
- **Preview**: Preview production build using `npm run preview`

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:
- **users**: User accounts (landowners, investors, admins)
- **lands**: Land property information
- **investments**: Investment records and tracking
- **documents**: Document management and storage
- **tasks**: Task management and workflow
- **sections**: Land section management

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **Role-based Access**: Different access levels for different user types
- **File Upload Security**: Secure file handling and validation

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database Setup**: Set up PostgreSQL database server
3. **Backend Deployment**: Deploy FastAPI application using Gunicorn or similar
4. **Frontend Deployment**: Build and deploy React application to web server
5. **Reverse Proxy**: Configure Nginx or Apache for routing

### Docker Deployment (Future Enhancement)

Docker configuration files can be added for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at http://localhost:8000/docs

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - User authentication and management
  - Land registration and management
  - Investment tracking
  - Document management
  - Admin dashboard

---

**RenewMart** - Connecting sustainable energy with smart investments 🌱⚡