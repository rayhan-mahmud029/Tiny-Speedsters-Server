const express = require('express');
const cors = require('cors');
require('dotenv').config()

// -------------
//      JWT => jot --------
const jwt = require('jsonwebtoken');
// create secret
// require('crypto').randomBytes(64).toString('hex')

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`speedster's server running`);
})


///=====----------==========-----------
//                 Mongo DB CODE STARTS FROM HERE

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1o3onh9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // database and collections
        const database = client.db("tinySpeedsters");
        const allToys = database.collection('allToys');

        // get all data from database
        app.get('/all-toys', async (req, res) => {
            const result = await allToys.find().toArray();
            res.send(result)
        })

        // get specific id data
        app.get('/all-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await allToys.find(query).toArray();
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

//                 Mongo DB CODE STARTS ENDS HERE
///=====----------==========-----------

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})