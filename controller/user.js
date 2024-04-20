
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import gqlClient from '../graphql/gqlClient.js';
import { CreateNextUserMutation, GetUserByEmailQuery } from '../graphql/mutations.js';
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
const router = express.Router();


//SIGN UP API
router.post('/auth/signup', async (req, res) => {
  try {
    const {
      email_Id, password, firstname, lastname, contactNumber, studentSlug,
    } = req.body;
    if (!email_Id || !password || !firstname || !lastname || !studentSlug || !contactNumber) {
      res.status(400).end();
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const userData = {
      email_Id,
      password: hashedPassword,
      firstname,
      lastname,
      contactNumber,
      studentSlug

    };
    const response = await gqlClient.request(CreateNextUserMutation, { userData });
    if (!response?.createNextUser) {
      console.log('CreateUser Failed, Response: ', response);
      res.status(400).end()
    }
    const token = jwt.sign({ user: response.createNextUser }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.send({ user: response.createNextUser, token });
  } catch (err) {
    console.log('POST auth/signup, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
});

//SIGN IN API
router.post('/auth/signin', async (req, res) => {
  console.log('hello');
  console.log(JWT_SECRET);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).end();
      return;
    }
    const getUserResponse = await gqlClient.request(GetUserByEmailQuery, { email });
    console.log('getUserResponse:', getUserResponse); // Log the response to check its structure
    const nextUser = getUserResponse && getUserResponse.studentDetail; // Adjust to match the structure of the response
    console.log('nextUser:', nextUser); // Log nextUser to check its value
    if (!nextUser) {
      console.log('User not found');
      res.status(400).json({ msg: 'Invalid Email Or Password' });
      return;
    }
    const hashedPassword = nextUser.password;
    console.log('hashedPassword:', hashedPassword); // Log hashedPassword to check its value
    console.log('password',password)
    // const isMatch = await bcrypt.compare(password, hashedPassword);
    if (password != hashedPassword) {
      console.log('Password does not match');
      res.status(400).json({ msg: 'Invalid Email Or Password' });
      return;
    }
    const token = jwt.sign({
      id: nextUser.studentSlug,
      email: nextUser.email_Id
    },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.status(200).json({ token });
  } catch (err) {
    console.log('POST auth/signin, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
});


// GET USER FROM TOKEN API
router.get('/auth/me', async (req, res) => {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = String(req?.headers?.authorization?.replace('Bearer ', ''));
    console.log('Token:', token); // Log the token to check if it's extracted correctly
    const decoded = jwt.verify(token, 'abracadabra');
    console.log('Decoded:', decoded); // Log the decoded token to check its content
    const getUserResponse = await gqlClient.request(GetUserByEmailQuery, { email: decoded.email });
    console.log('getUserResponse:', getUserResponse); // Log the response to check its structure
    const nextUser = getUserResponse && getUserResponse.studentDetail; // Adjust to match the structure of the response
    if (!nextUser) {
      res.status(400).json(defaultReturnObject);
      return;
    }
    delete nextUser.password;
    res.status(200).json({ authenticated: true, user: nextUser });
  } catch (err) {
    console.log('GET auth/me, Something Went Wrong', err); // Log the error for debugging
    res.status(400).json(defaultReturnObject);
  }
});


export default router;
