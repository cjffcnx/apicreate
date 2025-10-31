// Creation of a server
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables first

const app = express();

// Parse incoming JSON
app.use(express.json());

// Connect to MongoDB using .env variable
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
};

// Call the database connection function
connectDB();


// Now I have to make a book schema
const bookSchema = new mongoose.Schema({
    // Here I have to make an object. Previously I was not making schema and fetching data directly from in-memory array
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    author: {
        type: String,
        trim: true

    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,

    }

});

// We need to update the value so that updatedAt gets updated automatically

bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
})

// Just like we pushed book into the static array now we will create a model and use that to create and fetch books from the database
const Book = mongoose.model('Book', bookSchema);




// Default route
app.get('/', (req, res) => {
    res.send('Hello World');
});



// Get all books
app.get('/books', async (req, res) => {
   try {
      const books = await Book.find().sort({ createdAt: -1 });
      res.json(books);
   } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Server error" });
   }
});

// Add a new book
app.post('/books', async (req, res) => {

    //Schema bata book ko title author chahiyo previously array bata garda we had to create a new object to store the book and then push it
  // Now I am fetching schema data
    const {title,author}=req.body;

    if(!title){
        return res.status(400).json({message:"Title is required"});
    }

    // Previously I was making an object and pushing but now I will create a new book using the Book model
    const newBook=new Book({
        title,
        author
    })

    // Once new Book is created I will have to save it
    await newBook.save();

    // I need to push the book to do that. I pushed new book to books array

    res.status(201).json({
        message:"Book is added successfully",
        book:newBook
    })
});

// Update a book
app.put('/books/:id',async (req, res) => {
   try {
    // Extract book id from url params
const {id}=req.params;
const {title,author}=req.body;

//Check if the book exist if doesn't exist then no opeartion can be performed
const book=await Book.findById(id);

if(!book){
    return res.status(404).json({message:"Book not found"});
}
// Update only the required field
if(title!==undefined){
    book.title=title;
}
if(author!==undefined){
    book.author=author;
}


// Update the time stamp
book.updatedAt=Date.now();
await book.save();

res.json({
    message:"Book updated successfully",
    book
});
   } catch (error) {
    console.error(error);
res.status(500).json({ message: "Internal server error" });
   }
});

// Delete is also similar to update. I will get id in my url itself I need to take out that id I need to check if the id is there or not if present then I have to delete that from the object

app.delete("/books/:id", async (req, res) => {
try {
const { id } = req.params;

const book = await Book.findByIdAndDelete(id);
if (!book) {
return res.status(404).json({ message: "Book not found" });
}

res.json({
message: "Book has been deleted successfully"
})
// First perform the search operation
} catch (error) {
console.error(error);
}

})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
