const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*', // During development allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING
};

// Initialize Oracle client
async function initialize() {
    try {
        await oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMin: 10,
            poolMax: 10,
            poolIncrement: 0
        });
        console.log('Database connection pool created');
    } catch (err) {
        console.error('Error creating connection pool:', err);
    }
}

// Routes
// Suppliers
app.get('/api/suppliers', async (req, res) => {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(
            'SELECT * FROM SUPPLIERS',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
        connection.close();
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).json({ error: 'Error fetching suppliers' });
    }
});

app.post('/api/suppliers', async (req, res) => {
    let connection;
    try {
        console.log('Supplier creation request:', req.body);
        
        const { supplierName, address, contactPerson, phone, email } = req.body;
        
        // Validate required fields
        if (!supplierName) {
            return res.status(400).json({ error: 'Supplier name is required' });
        }
        if (!phone) {
            return res.status(400).json({ error: 'Phone is required' });
        }
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        connection = await oracledb.getConnection();
        
        // First check if sequence exists, if not create a new ID a different way
        const seqCheck = await connection.execute(
            `SELECT COUNT(*) AS COUNT FROM USER_SEQUENCES WHERE SEQUENCE_NAME = 'SUPPLIERS_SEQ'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        let newSupplierId;
        
        if (seqCheck.rows[0].COUNT > 0) {
            // Sequence exists, use it
            const seqResult = await connection.execute(
                `SELECT SUPPLIERS_SEQ.NEXTVAL AS ID FROM DUAL`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            newSupplierId = seqResult.rows[0].ID;
        } else {
            // Sequence doesn't exist, get max ID and add 1
            const maxIdResult = await connection.execute(
                `SELECT NVL(MAX(SUPPLIERID), 0) + 1 AS NEXT_ID FROM SUPPLIERS`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            newSupplierId = maxIdResult.rows[0].NEXT_ID;
        }
        
        // Now insert with the generated ID
        const result = await connection.execute(
            `INSERT INTO SUPPLIERS (SUPPLIERID, SUPPLIERNAME, ADDRESS, CONTACTPERSON, PHONE, EMAIL)
             VALUES (:id, :supplierName, :address, :contactPerson, :phone, :email)`,
            {
                id: newSupplierId,
                supplierName: supplierName,
                address: address || null,
                contactPerson: contactPerson || null,
                phone: phone,
                email: email
            },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        console.log('Supplier inserted successfully, ID:', newSupplierId);
        res.json({ 
            id: newSupplierId, 
            message: 'Supplier added successfully',
            supplier: {
                SUPPLIERID: newSupplierId,
                SUPPLIERNAME: supplierName,
                ADDRESS: address,
                CONTACTPERSON: contactPerson,
                PHONE: phone,
                EMAIL: email
            }
        });
    } catch (err) {
        console.error('Error adding supplier:', err);
        res.status(500).json({ 
            error: `Database error: ${err.message}`,
            details: err.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Customers
app.get('/api/customers', async (req, res) => {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(
            'SELECT * FROM CUSTOMERS',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
        connection.close();
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Error fetching customers' });
    }
});

app.post('/api/customers', async (req, res) => {
    let connection;
    try {
        console.log('Customer creation request:', req.body);
        
        const { customerName, businessType, address, phone, email } = req.body;
        
        // Validate required fields
        if (!customerName) {
            return res.status(400).json({ error: 'Customer name is required' });
        }
        
        connection = await oracledb.getConnection();
        
        // Try to insert the customer with better error handling
        const result = await connection.execute(
            `INSERT INTO CUSTOMERS (CUSTOMERID, CUSTOMERNAME, BUSINESSTYPE, ADDRESS, PHONE, EMAIL)
             VALUES (CUSTOMERS_SEQ.NEXTVAL, :customerName, :businessType, :address, :phone, :email)
             RETURNING CUSTOMERID INTO :id`,
            {
                customerName: customerName,
                businessType: businessType || null,
                address: address || null,
                phone: phone || null,
                email: email || null,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: true }
        );
        
        console.log('Customer inserted successfully, ID:', result.outBinds.id[0]);
        res.json({ 
            id: result.outBinds.id[0], 
            message: 'Customer added successfully',
            customer: {
                CUSTOMERID: result.outBinds.id[0],
                CUSTOMERNAME: customerName,
                BUSINESSTYPE: businessType,
                ADDRESS: address,
                PHONE: phone,
                EMAIL: email
            }
        });
    } catch (err) {
        console.error('Error adding customer:', err);
        
        let errorMessage = 'Error adding customer';
        
        if (err.message.includes('ORA-00001')) {
            // Look for specific constraint violations
            if (err.message.includes('SYS_C008281')) {
                errorMessage = 'A customer with this phone number already exists';
            } else if (err.message.includes('SYS_C008282')) {
                errorMessage = 'A customer with this email already exists';
            } else {
                errorMessage = 'A customer with this information already exists';
            }
        } else if (err.message.includes('ORA-02290')) {
            errorMessage = 'Business type must be one of: Wholesale, Retail, Restaurant, Sweet Shop, or Dry Fruit Shop';
        } else {
            errorMessage = `Database error: ${err.message}`;
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: err.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Sales
app.get('/api/sales', async (req, res) => {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(`
            SELECT s.*, c.CUSTOMERNAME, p.PACKAGESIZE_KG
            FROM SALES s
            JOIN CUSTOMERS c ON s.CUSTOMERID = c.CUSTOMERID
            JOIN PACKAGING p ON s.PACKAGEID = p.PACKAGEID
        `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
        connection.close();
    } catch (err) {
        console.error('Error fetching sales:', err);
        res.status(500).json({ error: 'Error fetching sales' });
    }
});

app.post('/api/sales', async (req, res) => {
    try {
        const { customerId, packageId, saleDate, quantitySold, pricePerUnit, totalAmount } = req.body;
        const connection = await oracledb.getConnection();
        const result = await connection.execute(
            `INSERT INTO SALES (SALEID, CUSTOMERID, PACKAGEID, SALEDATE, QUANTITYSOLD, PRICEPERUNIT, TOTALAMOUNT)
             VALUES (SALES_SEQ.NEXTVAL, :1, :2, :3, :4, :5, :6)
             RETURNING SALEID INTO :7`,
            [customerId, packageId, saleDate, quantitySold, pricePerUnit, totalAmount, oracledb.NUMBER],
            { autoCommit: true }
        );
        connection.close();
        res.json({ id: result.outBinds[0], message: 'Sale recorded successfully' });
    } catch (err) {
        console.error('Error recording sale:', err);
        res.status(500).json({ error: 'Error recording sale' });
    }
});

// Payments
app.get('/api/payments', async (req, res) => {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(`
            SELECT p.*, s.SALEID, c.CUSTOMERNAME
            FROM PAYMENTS p
            JOIN SALES s ON p.SALEID = s.SALEID
            JOIN CUSTOMERS c ON s.CUSTOMERID = c.CUSTOMERID
        `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
        connection.close();
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ error: 'Error fetching payments' });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const { saleId, paymentDate, amountPaid, paymentMode, paymentStatus } = req.body;
        const connection = await oracledb.getConnection();
        const result = await connection.execute(
            `INSERT INTO PAYMENTS (PAYMENTID, SALEID, PAYMENTDATE, AMOUNTPAID, PAYMENTMODE, PAYMENTSTATUS)
             VALUES (PAYMENTS_SEQ.NEXTVAL, :1, :2, :3, :4, :5)
             RETURNING PAYMENTID INTO :6`,
            [saleId, paymentDate, amountPaid, paymentMode, paymentStatus, oracledb.NUMBER],
            { autoCommit: true }
        );
        connection.close();
        res.json({ id: result.outBinds[0], message: 'Payment recorded successfully' });
    } catch (err) {
        console.error('Error recording payment:', err);
        res.status(500).json({ error: 'Error recording payment' });
    }
});

// Packages
app.get('/api/packages', async (req, res) => {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(`
            SELECT p.*, pc.CASHEWTYPE
            FROM PACKAGING p
            JOIN PROCESSEDCASHEW pc ON p.CASHEWID = pc.CASHEWID
            WHERE p.PACKED = 1
        `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
        connection.close();
    } catch (err) {
        console.error('Error fetching packages:', err);
        res.status(500).json({ error: 'Error fetching packages' });
    }
});

// SQL Query endpoint
app.post('/api/query', async (req, res) => {
    try {
        const { query } = req.body;
        const connection = await oracledb.getConnection();
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
        connection.close();
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    }
});

// Add this health check endpoint to your server.js
app.get('/api/health', (req, res) => {
    try {
        // Basic health check that the server is responsive
        res.json({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Add this test endpoint
app.get('/api/test-db', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT 1 AS TEST FROM DUAL');
        res.json({ 
            status: 'success', 
            message: 'Database connection successful',
            result: result.rows 
        });
    } catch (err) {
        console.error('Database connection test failed:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Database connection failed',
            error: err.message 
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Add this new API endpoint for checking duplicates
app.post('/api/customers/check', async (req, res) => {
    let connection;
    try {
        const { email, phone } = req.body;
        connection = await oracledb.getConnection();
        
        // Check email
        if (email) {
            const emailCheck = await connection.execute(
                `SELECT COUNT(*) AS COUNT FROM CUSTOMERS WHERE EMAIL = :email`,
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (emailCheck.rows[0].COUNT > 0) {
                return res.json({ exists: true, field: 'email' });
            }
        }
        
        // Check phone
        if (phone) {
            const phoneCheck = await connection.execute(
                `SELECT COUNT(*) AS COUNT FROM CUSTOMERS WHERE PHONE = :phone`,
                { phone },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (phoneCheck.rows[0].COUNT > 0) {
                return res.json({ exists: true, field: 'phone' });
            }
        }
        
        res.json({ exists: false });
    } catch (err) {
        console.error('Error checking customer:', err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Initialize database connection and start server
initialize().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}); 