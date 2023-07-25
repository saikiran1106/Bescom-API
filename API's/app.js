const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017/";

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db('admin');
    const details = database.collection('Details');

    // Query for a movie that has the title 'Back to the Future'
    const query = { name: 'sai kiran utthunuri' };
    const detail = await details.findOne(query);

    console.log(detail);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);