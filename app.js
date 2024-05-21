const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const PORT = process.env.PORT;

mongoose.connect('mongodb://mongo:27017/read_share', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

//include all DB models
require('./models/Post')
require('./models/User')
require('./models/Book')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postsRoute');
const bookRouter = require('./routes/booksRoute');


// all Routes here
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/books', bookRouter);

app.listen(PORT, () => {
    console.log(`App running on port ${PORT} .....`);
});
