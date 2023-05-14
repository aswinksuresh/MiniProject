const express = require("express");
const path = require("path");
const app = express();
const session = require('express-session');
const hbs = require("hbs");
const port = process.env.PORT || 3000;
const Register = require("./models/registers");
const Doctor = require("./models/doctors");
const Appointment = require("./models/appointment");
const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
const passport = require('passport');
app.use(express.urlencoded({ extended: true }));//patient view cancel
const bodyParser = require('body-parser');

const moment = require('moment');

// Define a Handlebars helper to format a date using Moment.js
hbs.registerHelper('formatDate', function(date) {
  return moment(date).format('MMM D, YYYY');
});


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));




// initialize passport and configure session support
app.use(passport.initialize());
app.use(passport.session());







app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",templates_path);
hbs.registerPartials(partials_path);



app.get("/",(req, res) => {
    res.render("index")
});

app.get("/register", (req, res)=>{
    res.render("register");
})
//SignUP
app.post("/register", async(req, res)=>{
    
    try {
        const registerUser = new Register({
            
             name:req.body.name,
             email:req.body.email,
             password:req.body.password

        })
       const registered= await registerUser.save();
       res.status(201).render("login");
        //const password = req.body.password;
        
        
    } catch (error) {
        res.status(400).send(error)
        console.log(error);
        
    }
})

app.get("/login", (req, res)=>{
    res.render("login");
})


/*app.get("/doctors", (req, res)=>{
  const name = req.session.name;
  res.render('doctors', {name: name});
})*/
//Login
app.post('/login', async (req, res) => { 
    try {
      const email = req.body.email;
      const password = req.body.password;
     const useremail = await Register.findOne({email:email});
      const doctoremail = await Doctor.findOne({email:email});
      //console.log(doctoremail.password);
      if(useremail != null){
      if (useremail.password === password) {
        const name = useremail.name;
        const userId = useremail._id;
        req.session.userId = userId
        req.session.name = name;
         res.status(201).render('search',{name: name,userId: userId});
      }}
      else if(doctoremail != null){
        if (doctoremail.password === password) {
         const doctorName=doctoremail.name
         res.status(201).redirect('/doctorview/' + encodeURIComponent(doctorName));
         //res.render('doctorview', { appointments: appointments, doctorName: doctorName });
      }}
      else{
        res.send("Invalid login details");
        //res.status(401).render('login', { message: 'Invalid login details' });
      
      }
    } catch (error) {
      console.error(error);
      res.status(400).send('Invalid login details');
    }
  });

//LogOut
/*app.get('/logout', (req, res) => {
  req.logout(); // this method is provided by the passport module if you are using it
  req.session.destroy();
  res.redirect('/login'); // redirect to the login page after logout
});*/
app.get('/logout', function(req, res){
  req.logout(function(err){
    if(err){
      console.log(err);
      return next(err);
    }
    // Redirect to the login page after logout
    res.redirect('/');
  });
});


  //getting user name
  
  




  //Search functionality for doctor
 // assuming you have defined a GET route to handle the /doctors search query
 app.get("/doctors", async (req, res) => {
  try {
    const searchParam = req.query.field.trim();
    const searchRegex = new RegExp(searchParam, 'i');
    if (!searchParam) {
      return res.render("doctors", { doctors: [] });
    }
    const doctors = await Doctor.find({
      $and: [
        { availability: true},
        {
          $or: [
            { name: { $regex: searchRegex } },
            { specialization: { $regex: searchRegex } },
            { field: { $regex: searchRegex } },
            {
              $and: [
                { specialization: { $regex: searchRegex } },
                { field: { $regex: searchRegex } },
              ],
            },
          ],
        },
      ],
    });
    return res.render("doctors", { doctors, username:req.session.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});




//Getting doctors details
app.get('/appointment/:id', async (req, res) => {
  try {
    // Retrieve the doctor with the specified ID
    const doctor = await Doctor.findById(req.params.id);
    // Render the doctor details page and pass the doctor data to the template
    res.render('appointment', { doctor,username:req.session.name,userId:req.session.userId});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//Book Appointment
//let counter = 0;
app.post("/appointment", async (req, res) => {
  try {
    const {
      datePicker,
      patient_Id,
      patientName,
      doctorName,
      doctorLocation,
      consultationTime,
      doctorSpecialization,
    } = req.body;

    const existingAppointment = await Appointment.findOne({
      patientName: patientName,
      doctorName: doctorName,
      patient_Id: patient_Id,
    });
    if (existingAppointment) {
      res
        .status(409)
        .send("Appointment already booked for this patient and doctor.");
    } else {
      // find the count of existing appointments for the same doctor and date
      const existingCount = await Appointment.countDocuments({
        doctorName: doctorName,
        date: datePicker,
      });
      const token = existingCount + 1;

      const bookAppointment = new Appointment({
        token: token,
        doctorName: doctorName,
        doctorSpecialization: doctorSpecialization,
        patientName: patientName,
        patient_Id: patient_Id,
        time: consultationTime,
        date: datePicker,
        location: doctorLocation,
      });
      const booked = await bookAppointment.save();
      console.log(booked);

      res.status(201).send(`Appointment booked successfully! Token No: ${token}`);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Already has an appointment!");
    console.log(error.errors);
  }
});



//cancel appointment

app.post('/cancel-appointment/:appointmentId', async (req, res) => {
  const appointmentId = req.params.appointmentId;
  
  try {
    await Appointment.findByIdAndDelete(appointmentId);
    const userId = req.session.userId;
    const appointments = await Appointment.find({ patient_Id: userId });
    const html = appointments.map(appointment => {
      return `
        <tr>
          <td>${formatDate(appointment.date)}</td>
          <td>${appointment.time}</td>
          <td>${appointment.doctorName}</td>
          <td>
            <form action="/cancel-appointment/${appointment._id}" method="POST">
              <button class="cancel-button" data-appointment-id="${appointment._id}">Cancel</button>
            </form>
          </td>
        </tr>
      `;
    }).join('');

    res.send(html);
  } catch (err) {
    console.log(err);
  }
});


//Appointment view by patient
app.get("/patientview/:userId", async (req, res) => {
  const userId = req.params.userId;
  const userName = req.session.name;
  try {
    const appointments = await Appointment.find({ patient_Id: userId});
    res.render("patientview", { appointments: appointments,name:req.session.name });
  } catch (err) {
    console.log(err);
  }
});
//Appointment view by doctor
app.get("/doctorview/:name", async (req, res) => {
  const doctorName = req.params.name;
  try {
    const appointments = await Appointment.find({ doctorName: doctorName });
    res.render("doctorview", { appointments: appointments,doctorName: doctorName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



















//contact us
app.get('/contact', (req, res) => {
  res.render('contact');
});



























app.listen(port, () => {
    console.log("Server is running at port no ${port}");
})
const mongoose = require('mongoose');
const dbUrl ="mongodb+srv://aswin:aswin2002@cluster0.nvwem9d.mongodb.net/?retryWrites=true&w=majority"

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
   .connect(dbUrl, connectionParams)
   .then(() => {
    console.log('MongoDB Atlas connected');
  })
  .catch((err) => {
    console.error(err);
  });
  