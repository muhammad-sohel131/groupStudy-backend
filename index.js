const express = require('express');
const cors = require('cors')
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://job-portal-504b7.web.app',
    'https://job-portal-504b7.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jd7el.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let assignmentsCollection;

// Connect to MongoDB and initialize the assignments collection
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    assignmentsCollection = client.db('group-study').collection('assignments');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Express.js server!');
});

app.get('/assignments', async (req, res) => {
  try {
    const cursor = assignmentsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send('Error fetching assignments');
  }
});

app.post('/assignments', async (req, res) => {
  try {
    const data = req.body;
    const result = await assignmentsCollection.insertOne(data);
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.delete('/assignments/:id', async (req, res) => {
  
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Ensure the MongoDB client closes gracefully on server termination
// process.on('SIGINT', async () => {
//   console.log('Closing MongoDB connection...');
//   await client.close();
//   process.exit(0);
// });
