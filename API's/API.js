const express = require("express");
const { MongoClient , ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const accountSid = "ACfa3df292805f8d2b9e6db4b90384050f";
const authToken = "f70bc8027f25636899d7a560105381a8";
const clients =  twilio(accountSid, authToken);

// Replace the uri string with your connection string.
const uri = "mongodb+srv://sai:sai@cluster0.muh1mrb.mongodb.net/?retryWrites=true&w=majority";
const dbName = "admin";

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const Chart = require("chart.js");

const app = express();
app.set("view engine", "ejs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bescom API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./API.js"],
};

const swaggerSpec = swaggerJsDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get the login page.
 *     responses:
 *       '200':
 *         description: Successful response.
 */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});


/**
 * @openapi
 * /register:
 *   get:
 *     summary: Get the register page.
 *     responses:
 *       '200':
 *         description: Successful response.
 */
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/Register.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
})

/**
 * @openapi
 * /form:
 *   get:
 *     summary: Get the form page.
 *     responses:
 *       '200':
 *         description: Successful response.
 */
app.get("/form", (req, res) => {
  res.sendFile(__dirname + "/public/form.html");
});



/**
 * @openapi
 * /login:
 *   post:
 *     summary: Process the login request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DID:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response. User is verified and login successful.
 *       '400':
 *         description: Invalid DID or mobile number. Please try again.
 *       '401':
 *         description: User not verified. Please verify your account before logging in.
 *       '500':
 *         description: An error occurred. Unable to process the login request.
 */
app.post("/login", async (req, res) => {
  const client = new MongoClient(uri , {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  try {
    await client.connect();
    const database = client.db("test");
    const details = database.collection("Details");

    // Query for a user with the provided DID
    const query1 = { DID: req.body.DID };
    const user_DID = await details.findOne(query1);

    const query2 = { Mobile: req.body.mobile };
    const user_mobile = await details.find(query2);

    if (user_DID && user_DID.verified === "yes") {
      // User is verified, pass user data to the next page
      res.render("next", { user: user_DID });
    } else if (user_mobile && user_mobile.verified === "yes") {
      // User is verified, pass user data to the next page
      res.render("next", { user: user_mobile });
    } else {
      // User is not verified or invalid DID/mobile number, display an error message
      res.status(401).send("Invalid credentials or user not verified.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  } finally {
    await client.close();
  }
});





/**
 * @openapi
 * /send-otp:
 *   post:
 *     summary: Send OTP to the user's mobile number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: An error occurred.
 */

app.post("/send-otp", async (req, res) => {
    const client = new MongoClient(uri , {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  try {
    await client.connect();
    const database = client.db("test");
    const details = database.collection("Details");

    const mobile = req.body.mobile;
    const TimeStamp = Math.floor(new Date().getTime() / 1000);
  

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via Twilio
    const message = await clients.messages.create({
      body: `Your OTP: ${otp}`,
      from: '+15733832863',
      to: mobile
    });

    // Save verification SID
    const verificationSid = message.sid;

    // Save OTP and verification SID to the database

  await details.updateOne({ mobile: mobile },{ $set: { otp: otp.toString(), verificationSid: verificationSid , TimeStamp : TimeStamp  } } );
 
    
    res.json({ sid: verificationSid });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  } finally {
    await client.close();
  }
});



/**
 * @openapi
 * /verify-otp:
 *   post:
 *     summary: Verify the OTP entered by the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               otp:
 *                 type: string
 *               password:
 *                 type: string

 *     responses:
 *       '200':
 *         description: OTP verified successfully.
 *       '400':
 *         description: OTP verification failed.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: An error occurred.
 *       '401':
 *         description: OTP has expired. 
 */
app.post("/verify-otp", async (req, res) => {
   const client = new MongoClient(uri , {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  try {
    await client.connect();
    const database = client.db("test");
    const details = database.collection("Details");

    const mobile = req.body.mobile;
    const otp = req.body.otp;
    const password = req.body.password;

    const currentTimeStamp = Math.floor(new Date().getTime() / 1000);

    const user = await details.findOne({ mobile: mobile });
    const timestamp = user.TimeStamp;

    const expirytime = 2 * 60 ;

    console.log(expirytime);

    const timediff = currentTimeStamp - timestamp;

    console.log(timediff);

    if(!user){
      res.status(404).send("User not found.");
    }

    if(user.verified === "yes"){
      return res.json({ message: "User already verified." });
    }

    if(user.otp === otp ){

      if(timediff <= expirytime){
      await details.updateOne({ mobile: mobile },{ $set: { verified: "yes" , password: password } });
      return res.status(200).json({ message: "OTP verified successfully." });
    }
       else{
         return res.status(401).json({ message: "OTP has expired" });
       }
    } else {
      res.status(400).json({ message: "OTP verification failed." });
    }

  }
  catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  } finally {
    await client.close();
  }
})

/**
 * 
@openapi

 * /monthly-consumption:
 *   post:
 *     summary: Fetch user's monthly energy consumption data.
 *     description: Retrieve monthly energy consumption data for the user based on their mobile number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 
 *     responses:
 *       '200':
 *         description: Successful response. Returns monthly energy consumption data.
 *         
 *       '404':
 *         description: User not found or data not available.
 *       '500':
 *         description: An error occurred while fetching data.
 */

app.post("/monthly-consumption", async (req, res) => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const database = client.db("test");
    const details = database.collection("Details");

    const mobile = req.body.mobile;

    // Query for a user with the provided mobile number
    const query = { mobile: mobile };
    const user = await details.findOne(query);

    if (!user) {
      // User not found
      return res.status(404).json({ error: "User not found or data not available." });
    }

    if (!user.monthly_consumption) {
      // Monthly consumption data not available
      return res.status(404).json({ error: "Monthly consumption data not available for the user." });
    }

    // Return the monthly consumption data
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  } finally {
    await client.close();
  }
});



const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
