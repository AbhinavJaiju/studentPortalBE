import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import gqlClient from "../graphql/gqlClient.js";
import {
  CreateNextUserMutation,
  GetUserByEmailQuery,
  GetAdminDetailsQuery,
  CreateNoticeMutation,
  publishNotice,
  deleteNotice,
  updateNotice,
  CreateRequest,
  publishRequest,
  getNotices,
  createSubjectDate,
  PublishSubjectDate
} from "../graphql/mutations.js";
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
const router = express.Router();

//SIGN UP API
router.post("/auth/signup", async (req, res) => {
  try {
    const {
      email,
      studentSlug,
      studentId,
      password,
      firstname,
      lastname,
      contactNumber,
    } = req.body;
    if (
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !studentSlug ||
      !contactNumber ||
      !studentId
    ) {
      res.status(400).end();
    }

    const userData = {
      email,
      studentSlug: studentSlug,
      studentId,
      password,
      firstname,
      lastname,
      contactNumber,
    };
    console.log(email_Id);
    console.log("hello");
    const response = await gqlClient.request(CreateNextUserMutation, {
      userData,
    });
    console.log(response);
    if (!response?.createNextUser) {
      console.log("CreateUser Failed, Response: ", response);
      res.status(400).end();
    }
    const token = jwt.sign({ user: response.createNextUser }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.send({ user: response.createNextUser, token });
  } catch (err) {
    console.log("POST auth/signup, Something Went Wrong: ", err);
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
    console.log(email)
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

// Helper function to handle user response
async function handleUserResponse(res, query, email, detailKey) {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const getUserResponse = await gqlClient.request(query, { email });
    console.log('getUserResponse:', getUserResponse); // Log the response to check its structure

    console.log(getUserResponse)
    const nextUser = getUserResponse.studentDetail ? getUserResponse.studentDetail : getUserResponse; // Adjust to match the structure of the response
    if (!nextUser) {
      console.log('hjasd')
      res.status(400).json(defaultReturnObject);
      return;
    }
    console.log('nextUser',nextUser)
    delete nextUser.password; // Remove the password from the user details
    res.status(200).json({ authenticated: true, user: nextUser });
  } catch (err) {
    console.log('GET auth/me, Something Went Wrong', err); // Log the error for debugging
    res.status(400).json(defaultReturnObject);
  }
}

// GET USER FROM TOKEN API
router.get('/auth/me', async (req, res) => {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = String(req?.headers?.authorization?.replace('Bearer ', ''));
    console.log('Token:', token); // Log the token to check if it's extracted correctly
    const decoded = jwt.verify(token, 'abracadabra');
    console.log('Decoded:', decoded); // Log the decoded token to check its content

    if (decoded.email === 'admin@gmail.com') {
      console.log("hello")
      // Call the admin details function
      handleUserResponse(res, GetAdminDetailsQuery, decoded.email, 'adminDetail');
    } else {
      // Call the user details function
      handleUserResponse(res, GetUserByEmailQuery, decoded.email, 'studentDetail');
    }
  } catch (err) {
    console.log('GET auth/me, Something Went Wrong', err); // Log the error for debugging
    res.status(400).json(defaultReturnObject);
  }
});


// Admin Sign IN

//SIGN IN API
router.post("/auth/admin", async (req, res) => {
  console.log(JWT_SECRET);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).end();
      return;
    }
    console.log(email, password);
    const getUserResponse = await gqlClient.request(GetAdminDetailsQuery, {
      email,
    });
    console.log("getUserResponse:", getUserResponse); // Log the response to check its structure
    const nextUser = getUserResponse && getUserResponse.admin; // Adjust to match the structure of the response
    console.log("nextUser:", nextUser); // Log nextUser to check its value
    if (!nextUser) {
      console.log("User not found");
      res.status(400).json({ msg: "Invalid Email Or Password" });
      return;
    }
    const hashedPassword = nextUser.adminPassword;
    console.log("hashedPassword:", hashedPassword); // Log hashedPassword to check its value
    console.log("password", password);
    // const isMatch = await bcrypt.compare(password, hashedPassword);
    if (password != hashedPassword) {
      console.log("Password does not match");
      res.status(400).json({ msg: "Invalid Email Or Password" });
      return;
    }
    const token = jwt.sign(
      {
        id: nextUser.adminSlug,
        email: nextUser.adminEmail,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.status(200).json({ token });
  } catch (err) {
    console.log("POST auth/signin, Something Went Wrong: ", err);
    res.status(400).send({ error: true, message: err.message });
  }
});

// Endpoint to create a new notice
router.post('/notices', async (req, res) => {
  try {
    const { email, id, description,active} = req.body;
    console.log(email)
console.log(id)
console.log(description)
console.log(active)
    // Validate input
    if (!id || !description || !active) {
      return res.status(400).send({ error: true, message: 'ID andd description are required' });
    }

    // Prepare the notice data
    const noticeData = { id, description };

    // Create the notice
    const response = await gqlClient.request(CreateNoticeMutation, {email, id, description,active});
    console.log('CreateNotice Response:', response);

    // Check if the notice was created successfully
    if (!response?.createNotice) {
      console.log('CreateNotice Failed, Response:', response);
      return res.status(400).send({ error: true, message: 'Failed to create notice' });
    }
    console.log(response.createNotice.id)
    const ID = response.createNotice.id;

    const publishResponse = await gqlClient.request(publishNotice,{ID})

    console.log(publishResponse);
    if(!publishResponse){
      console.log('CreateNotice Failed, Response:', response);
    }
    // Send the response with the created notice
    res.status(201).send({ notice: response.createNotice });
  } catch (err) {
    console.log('POST /api/notices, Something Went Wrong:', err);
    res.status(500).send({ error: true, message: err.message });
  }
});

router.post('/createSubjectDate', async(req,res)=>{
  console.log('jello')
  try{
    console.log(req.body)
    const {subjectId,subjectDateTime,subjectSlug, emailId} = req.body
    console.log(subjectId)
    if(!subjectId || !subjectDateTime || !subjectSlug || !emailId){
      return res.status(400).send({error:true, message:"Provide required data"});
    }
    const response  =  await gqlClient.request(createSubjectDate,{subjectId:subjectId,emailId:emailId,subjectSlug:subjectSlug,subjectDateTime:subjectDateTime });
    if(!response?.createSubjectDate){
      console.log('Create Subject Date Failed, Response:', response);
      return res.status(400).send({error:true, message:"Failed to create SubjectDateTime"});
    }

    console.log(response.createSubjectDate.id);
    const ID = response.createSubjectDate.id;
    
    const publishResponse = await gqlClient.request(PublishSubjectDate,{ID})
    console.log(publishResponse)
    if(!publishResponse.publishSubjectDate){
      console.log('Create Subject Date Failed, Response:', publishResponse);
    }

    res.status(201).send({notice:response.createSubjectDate});
  }catch(err){
    console.log("POST /api/createSubjectDate, Something went wrong:", err);
    res.status(500).send({error:true, message:err.message});
  }
});

router.post('/delete', async (req,res) => {
  try{
    const {ID} =req.body;
    console.log(ID);

    if(!ID){
      return res.status(400).send({error:true, message:'id required'});
    }
    const response = await gqlClient.request(deleteNotice,{id:ID})
      console.log(response)
      if(!response?.deleteNotice){
        console.log('DeleteNotice Failed, Response:', response);
      return res.status(400).send({ error: true, message: 'Failed to create notice' });
      }

      // Send the response with the created notice
    res.status(201).send({ notice: response.createNotice });
  }catch (err) {
    console.log('POST /api/delete, Something Went Wrong:', err);
    res.status(500).send({ error: true, message: err.message });
  }
})

router.post('/update',async(req,res) =>{
  try{
    // console.log(req)
    const {id, active} = req.body;
    console.log(id);
    console.log(active);
    if(!id){
      return res.status(400).send({error:true, message:"id and data required"});
    }
    const response = await gqlClient.request(updateNotice,{id, active})
    console.log(response)
    if(!response?.updateNotice){
      console.log('UpdateNotice Failed, Response :' ,response);
      return res.status(400).send({error:true, message:'Failed to update notice'});
    }

    const ID = response.updateNotice.id;
    console.log(response.updateNotice)

    const publishResponse = await gqlClient.request(publishNotice,{ID})

    console.log(publishResponse);
    if(!publishResponse){
      console.log('CreateNotice Failed, Response:', response);
    }

    res.status(201).send({notice:response.updateNotice})
  }catch (err) {
    console.log('POST /update, Something Went Wrong:', err);
    res.status(500).send({ error: true, message: err.message });
  }
})

router.post('/request', async(req,res)=>{
  try{
    const {id,email,title,description} = req.body
  if(!id || !email){
    return res.status(400).send({error:true, message:"id and data required"});
  }
  const response = await gqlClient.request(CreateRequest,{studentEmail:email, requestTitle:title, requestDescription:description,requestId:id})
  console.log(response)
  if(!response?.createRequest){
    console.log('Create Request Failed, Response:', response);
    return res.status(400).send({error:true, message:"Failed to create request"});
  }

  const ID = response.createRequest.id
  const publishResponse = await gqlClient.request(publishRequest,{ID})

  console.log(publishResponse);
    if(!publishResponse){
      console.log('CreateNotice Failed, Response:', response);
    }
    res.status(201).send({notice:response.createRequest})
  }catch(err){
    console.log('POST /request, Something Went Wrong:', err);
    res.status(500).send({ error: true, message: err.message });
  }
});

router.get('/getnotice', async(req,res)=>{
  try{
    const response = await gqlClient.request(getNotices)
    console.log(response)
    if(!response?.notices){
      console.log('Get Request Failed, Response:', response);
      return res.status(400).send({error:true, message:"Failed to Get"});
    }
    res.status(201).send({notice:response.notices})
  }catch(err){
    console.log('POST /notices, Something Went Wrong:', err);
    res.status(500).send({ error: true, message: err.message });
  }
});



export default router;
