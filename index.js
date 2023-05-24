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
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}
app.use(cors(corsConfig));
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
            const searchTerm = req.query.term;
            const searchQuery = req.query.query;
            const sortBy = req.query.sort;
            const order = req.query.order;
            const limit = parseInt(req.query.limit);

            console.log(limit, sortBy, order, searchTerm, searchQuery);

            // implement search query
            let query = {};
            if (searchTerm === 'category') {
                query = { category: searchQuery };
            }
            else if (searchTerm === 'name') {
                query = { name: searchQuery };
            }


            console.log(query);
            const result = await allToys.find(query).toArray();

            // implement sort operation
            if (sortBy === 'price') {
                if (order === 'asc') {
                    result.sort((a, b) => a.price - b.price)
                } else if (order === 'dsc') {
                    result.sort((a, b) => b.price - a.price)
                }
            }

            // implement limit operation
            if (limit > 0) {
                result.splice(limit);
            }

            res.send(result)
        })

        // get specific id data
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allToys.find(query).toArray();
            res.send(result)
        })

        // get specific user data
        app.get('/toys/user', async (req, res) => {
            const userEmail = req.query.email;
            console.log(userEmail);
            const query = { sellerEmail: userEmail };
            const result = await allToys.find(query).toArray();
            res.send(result)
        })

        // delete specific id data
        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allToys.deleteOne(query);
            res.send(result)
        })

        // update specific id data
        app.put('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;

            // create a filter for a movie to update
            const filter = { _id: new ObjectId(id) };

            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };

            // create a document that sets the plot of the movie
            const updateToy = {
                $set: {
                    price: data.price,
                    availableQuantity: data.quantity,
                    description: data.description
                },
            };

            const result = await allToys.updateOne(filter, updateToy, options);
            res.send(result)
        })



        // post new toy
        app.post('/add-toy', async (req, res) => {
            const data = req.body;
            const doc = {
                "picture": data.picture,
                "name": data.toyName,
                "sellerName": data.sellerName,
                "sellerEmail": data.sellerEmail,
                "price": data.price,
                "ratings": data.ratings,
                "availableQuantity": data.quantity,
                "category": data.category,
                "description": data.description
            }
            const result = await allToys.insertOne(doc);
            res.send(result);
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