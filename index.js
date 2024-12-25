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

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
let submissionsCollection;

// Connect to MongoDB and initialize the assignments collection
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    assignmentsCollection = client.db('group-study').collection('assignments');
    submissionsCollection = client.db('group-study').collection('submissions');
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
app.get("/assignments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await assignmentsCollection.findOne({ _id: new ObjectId(id) })
    res.send(result)
  } catch (error) {
    console.error("Error getting a assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
})
app.delete("/assignments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await assignmentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Assignment deleted successfully" });
    } else {
      res.status(404).json({ message: "Assignment not found" });
    }
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.put('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedData = req.body; 

    const result = await assignmentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.modifiedCount > 0) {
      res.status(200).send({ message: "Assignment updated successfully", result });
    } else {
      res.status(404).send({ message: "Assignment not found or no changes made" });
    }
  } catch (e) {
    console.error("Error updating assignment:", e);
    res.status(500).send({ message: "Failed to update assignment" });
  }
});

// ----------------------------submissions api---------------------
app.get('/submissions', async (req, res) => {
  const email = req.query?.email;
  const status = req.query?.status;
  const query = {};
  if (email) query.userEmail = email;
  if(status) query.status = status
  try {
    const cursor = submissionsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send('Error fetching assignments');
  }
});
app.post('/submissions', async (req, res) => {
  try {
    const data = req.body;
    const result = await submissionsCollection.insertOne(data);
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})
app.patch('/submissions/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: data.status,
      obtainedMarks : data.obtainedMarks,
      feedback: data.feedback
    }
  }
  const result = await submissionsCollection.updateOne(filter, updatedDoc);
  res.send(result)
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
