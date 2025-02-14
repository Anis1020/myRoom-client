const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SK_KEY);

const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
// app.use(morgan);

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l8qzz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const roomsCollection = client.db("roomRentDB").collection("rooms");
    const usersCollection = client.db("roomRentDB").collection("users");

    //verifyAdmin middleware
    const verifyAdmin = async (req, res, next) => {
      const user = req.user;
      const query = { email: user?.email };
      const result = await usersCollection.findOne(query);
      if (!result || result?.role === "admin")
        return res.status(401).send({ message: "forbidden access" });
      next();
    };
    //verifyHost middleware
    const verifyHost = async (req, res, next) => {
      const user = req.user;
      const query = { email: user?.email };
      const result = await usersCollection.findOne(query);
      if (!result || result?.role === "host")
        return res.status(401).send({ message: "forbidden access" });
      next();
    };
    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
        console.log("Logout successful");
      } catch (err) {
        res.status(500).send(err);
      }
    });
    //user related api
    app.put("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      //check user exist or not
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        if (user.status === "Requested") {
          const result = await usersCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(result);
        }
      } else {
        if (isExist) return res.send(isExist);
      }

      const options = { upsert: true };
      const updateUser = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(
        query,
        updateUser,
        options
      );
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // update user role
    app.patch("/user-role/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email };

      const updatedDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    // app.patch("/user-role/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const user = req.body; // user body থেকে পাওয়া হচ্ছে

    //   // এখানে, নিশ্চিত করুন যে user.role কেবল তখনই পরিবর্তন হবে যখন সেটা ইচ্ছাকৃতভাবে হবে
    //   if (user.role) {
    //     const query = { email };
    //     const updatedDoc = {
    //       $set: {
    //         role: user.role, // শুধুমাত্র role পরিবর্তন হচ্ছে
    //         timestamp: Date.now(),
    //       },
    //     };
    //     try {
    //       const result = await usersCollection.updateOne(query, updatedDoc);
    //       res.send(result);
    //     } catch (error) {
    //       res.status(500).send({ message: "Error updating role", error });
    //     }
    //   } else {
    //     res.status(400).send({ message: "Role not provided for update" });
    //   }
    // });

    // rooms related apis
    app.get("/rooms", async (req, res) => {
      const category = req.query.category;

      let query = {};
      if (category && category !== "null") query = { category };
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/my-rooms/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "host.email": email };
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });
    //save a room data in db
    app.post("/room", verifyToken, verifyHost, async (req, res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData);
      res.send(result);
    });
    //delete room
    app.delete("/room/:id", verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.deleteOne(query);
      res.send(result);
    });

    //payment related apis
    app.post("/create-payment-intent", async (req, res) => {
      const price = req.body.price;
      const priceInCent = parseFloat(price) * 100;
      console.log("price come", priceInCent);
      if (!price || priceInCent < 1) return;
      //generate client secret
      const { client_secret } = await stripe.paymentIntents.create({
        amount: priceInCent,
        currency: "usd",

        automatic_payment_methods: {
          enabled: true,
        },
      });

      // send client secret as response
      res.send({ clientSecret: client_secret });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from StayVista Server..");
});

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`);
});
