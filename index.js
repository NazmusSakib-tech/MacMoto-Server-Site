const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o7umd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("mac-moto");
        const bikesCollection = database.collection("bikes");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const usersRatingsCollection = database.collection("ratings");


        //GET API for Find All Bikes
        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        })

        //GET API for Find A Single Bikes
        app.get('/bikes/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) }
            const cursor = await bikesCollection.findOne(query);
            res.send(cursor);
        })

        // POST API for single product place-order from user
        app.post('/productDetails/placeOrder', async (req, res) => {
            const product = req.body;
            const result = await ordersCollection.insertOne(product);
            res.json(result)
        })


        // Single POST Api for user info save to  database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        //Single users data update for google

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        })

        // For admin make PUT API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        // GET API find single user, IS admin? by email

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
                console.log('admin', user.role)
            }
            res.json({ admin: isAdmin });

        })

        // GET API for all data for Manage All orders from admin
        app.get("/manageAllOrders", async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
            // console.log(result);
        })

        //DELETE API for manage order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);

        })

        //DELETE product from Manage Products API
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);
            res.send(result);

        })


        // Update Single Product From Manage All Orders
        app.put('/updateSingleOrder/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Shipped"
                }
            };

            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })


        // POST API for single product insert from admin
        app.post('/addSingleProduct', async (req, res) => {
            const product = req.body;
            const result = await bikesCollection.insertOne(product);
            res.send(result)
            console.log('this is result', result);
        })

        // POST API for single insert Ratings from User
        app.post('/addRatings', async (req, res) => {
            const product = req.body;
            const result = await usersRatingsCollection.insertOne(product);
            res.send(result)
            console.log('this is result', result);
        })

        // GET API for all Ratings form reviews by user
        app.get("/reviews", async (req, res) => {
            const cursor = usersRatingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
            // console.log(result);
        })

        // GET API for MY Orders
        app.get('/myOrders', async (req, res) =>{
            const email = req.query.email;
            const query = { email: email}
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            console.log(orders);
            res.send(orders);
            

        })

         //DELETE API
         app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
            
        })



        console.log("database Connect Successfully");

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Salam From MAC MOTO')
})




app.listen(port, () => {
    console.log("Server running Successfully", port);

});