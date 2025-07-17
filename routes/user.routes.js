const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const userModel = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register',
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 8 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);
        
        if(!errors.isEmpty()) {
           return res.status(400).json
           ({ 
            errors: errors.array(),
            message: 'Invalid Data' 
        });
        }
        
        const { email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await userModel.create({
          email,
          username,
          password : hashedPassword
        })

        res.json(newUser);

})

router.get('/login', (req, res) => {
    res.render('login');
})

// POST Login
router.post('/login', 
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                errors: errors.array(),
                message: 'Invalid Data' 
            });
        }

        const { username, password } = req.body;
        const user = await userModel.findOne({ username });
        
        if (!user) {
            return res.status(400).json({ message: 'Username or password is incorrect' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Username or password is incorrect' });
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET,
      )

        res.cookie('token', token);
        res.send('Logged In');
    }
);

module.exports = router;