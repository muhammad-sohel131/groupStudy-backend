const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://group-study-b6d75.web.app',
    'https://group-study-b6d75.firebaseapp.com'
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

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
    // await client.connect();
    // console.log('Connected to MongoDB successfully!');
    assignmentsCollection = client.db('group-study').collection('assignments');
    submissionsCollection = client.db('group-study').collection('submissions');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();


const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: 'unAuthorized access!!' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access!' })
    }
    req.user = decoded;
    next();
  })

}

// Auth related APIs
app.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

  res
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
    .send({ success: true })

});
app.post('/logout', (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  })
  .send({success : true})
})
// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Express.js server!');
});

app.get('/assignments', async (req, res) => {
  try {
    const { difficulty, search } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const cursor = assignmentsCollection.find(filter);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send('Error fetching assignments');
  }
});

app.post('/assignments', verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const result = await assignmentsCollection.insertOne(data);
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})
app.get("/assignments/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await assignmentsCollection.findOne({ _id: new ObjectId(id) })
    res.send(result)
  } catch (error) {
    console.error("Error getting a assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
})
app.delete("/assignments/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const data = await assignmentsCollection.findOne({ _id: new ObjectId(id) });
    if (req.user.email !== data.email) {
      return res.status(403).send({ message: 'forbidden access' });
    }

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
app.put('/assignments/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const data = await assignmentsCollection.findOne({ _id: new ObjectId(id) });
    if (req.user.email !== data.email) {
      return res.status(403).send({ message: 'forbidden access' });
    }
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
app.get('/submissions', verifyToken, async (req, res) => {
  const email = req.query?.email;
  const status = req.query?.status;

  const query = {};
  if (email) {
    if (req.user.email !== email) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    query.userEmail = email;
  }
  if (status) query.status = status
  try {
    const cursor = submissionsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send('Error fetching assignments');
  }
});
app.post('/submissions', verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const result = await submissionsCollection.insertOne(data);
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})
app.patch('/submissions/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: data.status,
      obtainedMarks: data.obtainedMarks,
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

