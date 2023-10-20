const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bm0qnz4.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server
        await client.connect();

        const fashionCollection = client.db("fashionDB").collection("fashion");

        //  get for all data 
        app.get('/fashion', async (req, res) => {
            const cursor = fashionCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // single data get for showing same branded products in a page.
        app.get("/fashion/:brand_name", async (req, res) => {
            const brand_name = req.params.brand_name;
            const query = { brand_name: brand_name };
            const search = fashionCollection.find(query);
            // const file = (search) => {
            //     if (!search || search.length === 0) {
            //         return ('no file exist.')
            //     }
            //     else {}
            // }
            const result = await search.toArray();
            res.send(result);

        })

        // get for product details 
        app.get("/fashion/:id", async (req, res) => {
            const id = req.params.id;
            // console.log('the id for details:', id);
            const query = { _id: new ObjectId(id) };
            const result = await fashionCollection.findOne(query);
            res.send(result);
        })


        // post to create a product 
        app.post('/fashion', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await fashionCollection.insertOne(newProduct);
            res.send(result);
        })

        //put to update product card
        app.put('/fashion/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedProduct = req.body;
            const product = {
                $set: {
                    name: updatedProduct.name,
                    image: updatedProduct.image,
                    brand_name: updatedProduct.brand_name,
                    price: updatedProduct.price,
                    type: updatedProduct.type,
                    rating: updatedProduct.rating,
                    description: updatedProduct.description,

                }
            }
            const result = await fashionCollection.updateOne(filter, product, options);
            res.send(result);
        })


        // delete a product [client side not updated...]
        app.delete('/fashion/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await fashionCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('fashion and apparel page is running...');
});

app.listen(port, () => {
    console.log(`fashion and apparel website is on port: ${port}`);
})
