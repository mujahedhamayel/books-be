const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT;

mongoose.connect('mongodb://localhost:27017/read_share', {
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
//  CORS middleware
const corsOptions = {
    origin: '*', 
    optionsSuccessStatus: 200, 
  };
  
  app.use(cors(corsOptions));
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postsRoute');
const bookRouter = require('./routes/booksRoute');
const searchRouter = require('./routes/searchRoute');
const notificationRouter = require('./routes/notificationRoute');
const discussionRoomRouter = require('./routes/discussionRoomRoute');


// firebase notifications
const admin = require('firebase-admin');
const serviceAccount = require('./services/serviceAccountKey.json');

// all Routes here
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/books', bookRouter);
app.use('/api/search', searchRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/discussionRooms', discussionRoomRouter);



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

app.listen(PORT, () => {
    console.log(`App running on port ${PORT} .....`);
});
