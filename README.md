# Cashew Business Management System

![Cashew Management System](https://t4.ftcdn.net/jpg/01/71/82/79/240_F_171827945_jwDoVYgXxdLZ36IJMoplWyyGJ95eMh1w.jpg)

A comprehensive web-based application for managing cashew processing businesses, from raw material procurement to sales and financial tracking.

## Features

- **Dashboard**: Real-time overview of business metrics including sales, inventory, and pending payments
- **Supplier Management**: Track and manage cashew suppliers with contact information
- **Customer Management**: Maintain customer database with business types and contact details
- **Sales Management**: Record and track sales transactions with detailed reporting
- **Payment Processing**: Monitor payment status and transaction history
- **Inventory Management**: Track raw and processed cashew inventory levels
- **SQL Query Interface**: Direct database access for custom reporting and data analysis
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- React.js
- Tailwind CSS for styling
- Chart.js for data visualization

### Backend
- Node.js
- Express.js
- Oracle Database
- RESTful API architecture

## Database Schema

The application uses the following main database tables:

- **SUPPLIERS**: Stores supplier information
- **CUSTOMERS**: Stores customer information
- **RAWCASHEW**: Tracks raw cashew inventory
- **PROCESSEDCASHEW**: Tracks processed cashew inventory
- **PACKAGING**: Manages packaging information
- **SALES**: Records sales transactions
- **PAYMENTS**: Tracks payment information

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Oracle Database

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/cashew-business-management.git
cd cashew-business-management

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with the following variables:
# DB_USER=your_oracle_username
# DB_PASSWORD=your_oracle_password
# DB_CONNECTION_STRING=your_connection_string
# PORT=3000

# Start the server
npm run dev
```

## Usage

1. Access the application at `http://localhost:5173` (or the port specified by Vite)
2. Navigate through the sidebar to access different modules
3. Use the dashboard for a quick overview of business metrics
4. Manage suppliers, customers, inventory, sales, and payments through their respective interfaces
5. Use the SQL Query interface for custom data analysis

## Development

### Project Structure

```
├── backend/               # Backend API server
│   ├── server.js          # Express server setup
│   └── package.json       # Backend dependencies
├── src/                   # Frontend source code
│   ├── js/                # JavaScript utilities
│   ├── pages/             # HTML pages for each module
│   └── styles/            # CSS stylesheets
├── index.html             # Main entry point
├── package.json           # Frontend dependencies
└── README.md             # Project documentation
```

### Building for Production

```bash
# Build frontend
npm run build

# The build output will be in the 'dist' directory
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- Oracle Database for robust data storage
- React.js and Tailwind CSS for modern UI development
- Express.js for efficient API development