
//const scoreRepository = new ScoreRepository();

const connection = require('../database/connection');
//const mysql = require('mysql2');
const bcrypt = require('bcrypt');
exports.getUserProfile=(req, res)=> {
 // const userId = req.session.userId;

 console.log(req.user);


    connection.query(
      
      'SELECT * FROM user WHERE UserID=? ',[req.session],
      //'SELECT Username, Email, FullName, Bio ,locations, Birthdate, Gender, Phone, SocialLinks FROM user WHERE UserID = 3 ',
     (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found.' });
        }

        const userProfile = results[0];
        return res.json({ user: userProfile });
      },
    );
  }


  