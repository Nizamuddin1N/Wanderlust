const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Database connection
main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



app.get("/", (req, res) => {
    res.send("Hi, I am the root");
});
//index Route
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));
//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});
//Create new rou
app.post("/listings", wrapAsync(async(req, res, next) => {
    if (!req.body.listing) {
        throw new ExpressError(404, "Send valid data for listing");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));


//show route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });

}));
//Edit Route
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));
//update Route
app.put("/listings/:id", wrapAsync(async(req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(404, "Send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing }); // Make sure this is lowercase
    res.redirect(`/listings/${id}`);
}));
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));




// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("Sample listing was saved");
//  
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { meassage })
        // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});