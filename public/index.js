//<!-------------Kwality Kitchen Backend Source code by Ritank Saxena(github/ritank1998------------->
const express = require("express")   //importing express app
const cors = require("cors")   //importing cors for cross browser requests
const hbs = require("hbs")     //importing handlebars
const path = require("path")
const mongoose = require("mongoose")
const { json } = require("express") // importing json format from express to read the authentication data
const jwt = require("jsonwebtoken") // importing Jason web token
const multer = require("multer")
const port = process.env.PORT || 3000 // declaring the port which will be used for the session
const app = express()
const circulaJson = require("circular-json")
const novu = require("@novu/node")
const cookieParser = require("cookie-parser") //works as a middleware
const NOVU_API = '5a81b3ea5f716a12e4224205bbf4dcd1'

require("../db/conn") //importing the connection method with MongoDb databse
//require("../successfulOrders/db/connections")
const registeredUsers = require("../models/loginSchema") //importing the database schema
//const paymentConfirm = require("../successfulOrders/models/schema")



app.use(cors())
app.use(cookieParser())


//defining the path to the computer as we are using the handbars here , we are giving the express the path of  the files
const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")

//defining the method for the express to read the json format tokens
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(express.static(static_path))
app.set("views", template_path)
app.set("view engine", "hbs")

//initial get request for the express app as the lander page
app.get("/", (req, res) => {
    res.render("landingindex")
})

//when registration is called
app.get("/registration", (req, res) => {
    res.render("index")
})

//when login is called
app.get("/loginindex", (req, res) => {
    res.render("loginindex")
})

//this is the registration of the new user using the signup page

app.post("/registration", async (req, res) => {
    try {

        //fetching the password and confirm password from the registration page and saving as the variables
        const pass = req.body.password
        const conf_pass = req.body.confirm_password
        if (pass === conf_pass) {
            //creating a new variable to save the details of the new user on the db the details fetched here
            //are save on main ui & db
            const locate = req.body.location
            const newRegisteredUser = new registeredUsers({
                fullName: req.body.fullName,
                email: req.body.email,
                number: req.body.number,
                password: pass,
                confirm_password: conf_pass,
                address: req.body.address,
                location: req.body.location
            })
            //token generation using the new method defined on the database schema
            const Token = await newRegisteredUser.generateAuthenticationToken();

            //cookie is a inbuilt feature of the Nodejs . can be used directly.
            res.cookie("jwt", Token, {
                expires: new Date(Date.now() + 70000),
                httpOnly: true
            })

            
            //the costomer variable is created to store the data on the database 

            const costomer = await newRegisteredUser.save()
            
            res.status(201).render("indexAppPage")

        }

        else {
            res.send("Re-Enter the Password....")
        }
    } catch (e) {
        
        res.status(500).json(circulaJson.stringify({message: error.message}))
    }
})





//this is the login of the existing user using the login page using the POST method
app.post("/loginindex", async (req, res) => {

    //getting the email and password from the login page using the same process as in registration
    try {
        const email = req.body.email
        const pass = req.body.password

        const userEmail = await registeredUsers.findOne({ email: email })
        //token generation using the new method defined on the database schema
        const Token = await userEmail.generateAuthenticationToken();

        //login Cookie to keep the track of the Login of the user
        res.cookie("jwt", Token, {
            expires: new Date(Date.now() + 3000),
            httpOnly: true
        })
        //cookie is an inbuilt feature
        if (userEmail.password === pass) {
            res.status(400).render("indexAppPage")
        } else {
            res.status(404).send("Invalid username or password")
        }

    } catch (e) {
        res.status(404).send("User not found...")
    }
})

//displaying the Menu card using the get method
app.get("/Menu", (req, res) => {
    //requesting the cookie generating on login or sign to verify the user
    res.render("Menuindex")
})


//getting the dashboard using the get method
app.get("/dashboard", (req, res) => {
    res.render("dashboardindex")
})

//Menu Card Database is here
const db1 = mongoose.createConnection("mongodb://127.0.0.1:27017/MenuCard")
const db2 = mongoose.createConnection("mongodb://127.0.0.1:27017/MenuCard")
const db3 = mongoose.createConnection("mongodb://127.0.0.1:27017/MenuCard")
const db4 = mongoose.createConnection("mongodb://127.0.0.1:27017/MenuCard")
const db5 = mongoose.createConnection("mongodb://127.0.0.1:27017/MenuCard")
const db6 = mongoose.createConnection("mongodb://127.0.0.1:27017/MenuCard")

//Menu Items Validation is here
//Veg Curry
const vegCurries = db1.model("vegcurries", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    images: {
        data: Buffer,
        ContentType: String
    },

}))

//Non Veg Curry
const nonvegCurries = db2.model("nonvegcurries", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    images: {
        data: Buffer,
        ContentType: String
    },

}))


//Starters
const Starters = db3.model("Starters", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    images: {
        data: Buffer,
        ContentType: String
    },

}))


//Salads
const Salad = db4.model("Salad", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    images: {
        data: Buffer,
        ContentType: String
    },

}))


//Rice Items
const RiceItems = db5.model("RiceItems", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    images: {
        data: Buffer,
        ContentType: String
    },

}))



//Tandoor
const TandoorItems = db6.model("Tondoor" , mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    image: {
        data:Buffer,
        contentType: String
    }
}))
//Multer Functions to upload the images 

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage
}).single('testImage')


//Veg Curry Upload Api
app.post("/vegcurry", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).json(circulaJson.stringify({message : err.message}))
        } else {
            const newImage = new vegCurries({
                Name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: 'image/jpg'
                },
                price: req.body.Price
            })

            newImage.save()
                .then(() => res.status(200).send("Image Uploaded"))
                .catch((err) => res.status(500).json(circulaJson.stringify({message : err.message})))
        }
    })
})


//Nonveg Curry Upload Api
app.post("/nonvegcurry", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).json(circulaJson.stringify({message : err.message}))
        } else {
            const newImage = new nonvegCurries({
                Name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: 'image/jpg'
                },
                price: req.body.Price

            })

            newImage.save()
                .then(() => res.status(200).send("Image Uploaded"))
                .catch((err) => res.status(500).json(circulaJson.stringify({message : err.message})))
        }
    })
})


//Starters Upload Api
app.post("/starter", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).json(circulaJson.stringify({message : err.message}))
        } else {
            const newImage = new Starters({
                Name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: 'image/jpg'
                },
                price: req.body.Price
            })

            newImage.save()
                .then(() => res.status(200).send("Image Uploaded"))
                .catch((err) => res.status(500).json(circulaJson.stringify({message : err.message})))
        }
    })
})


//Salads Upload Api
app.post("/salad", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).json(circulaJson.stringify({message : err.message}))
        } else {
            const newImage = new Salad({
                Name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: 'image/jpg'
                },
                price: req.body.Price
            })

            newImage.save()
                .then(() => res.status(200).send("Image Uploaded"))
                .catch((err) => res.status(500).json(circulaJson.stringify({message : err.message})))
        }
    })
})


//Rice Items Upload Api
app.post("/rice", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).json(circulaJson.stringify({message : err.message}))
        } else {
            const newImage = new RiceItems({
                Name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: 'image/jpg'
                },
                price: req.body.Price
            })

            newImage.save()
                .then(() => res.status(200).send("Image Uploaded"))
                .catch((err) => res.status(500).json(circulaJson.stringify({message : err.message})))
        }
    })
})

//Tandoor
app.post("/tandoor" , (req,res)=>{
    upload(req, res,(err)=>{
        if(err){
            res.status(500).json(circulaJson.stringify({message: error.message}))
        }
        else{
            const newImage = new TandoorItems({
                Name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: 'image/jpg'
                },
                price: req.body.Price
            })
            newImage.save()
            .then(()=> res.status(200).send("Images Updated"))
            .catch((err)=> res.status(500).json(circulaJson.stringify({message : err.message})))
        }
    })
})

//Getting DB Data

//vegCurries
app.get("/vegcurries", async (req, res) => {
    const data = await vegCurries.find()
    try {
        res.status(200).send(data)
    } catch (error) {
        res.status(500).json(circulaJson.stringify({ message: error.message }))
    }
})

//nonVeg Currie
app.get("/nonvegcurries", async (req, res) => {
    const data = await nonvegCurries.find()
    try {

        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).json(circulaJson.stringify({ message: error.message }))
    }
})

//Rice items
app.get("/riceitems", async (req, res) => {
    const data = await RiceItems.find()
    try {
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).json(circulaJson.stringify({ message: error.message }))
    }
})

//tandoor
app.get("/tandoor", async(req,res)=>{
    const data = await TandoorItems.find()
    try{
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).json(circulaJson.stringify({ message: error.message }))
    }   
    
})
//Salads
app.get("/salad" , async(req,res)=>{
    const data = await Salad.find()
    try{
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).json(circulaJson.stringify({ message: error.message }))
    }
})
//Starters
app.get("/starter" , async(req,res)=>{
    const data = await Starters.find()
    try{
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).json(circulaJson.stringify({ message: error.message }))
    }
})


//running the app on server

app.listen(port, () => {
    console.log("Hi this the API is live now")
})
