const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const qrcode = require('qrcode');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/parking-apps', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

const parkingSchema = new mongoose.Schema({
  carNumber: String,
  arrivalTime: Date,
  departureTime: Date,
});

const Parking = mongoose.model('Parking', parkingSchema);


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('form');
});

app.post('/', async (req, res) => {

  const parking = new Parking({
    carNumber: req.body.carNumber,
    arrivalTime: new Date(),
  });
  await parking.save();

  // Redirect the user to the new QR code route with the parking ID
  res.redirect(`/qr/${parking._id}`);
});

app.get('/qr/:id', async (req, res) => {
  const parkingId = req.params.id;

  // Find the parking object for the given ID
  const parking = await Parking.findById(parkingId);

  if (!parking) {
    return res.status(404).send('Parking not found');
  }

  // Generate the link and QR code data
  const startLat = '37.7749';
  const startLng = '-122.4194';
  const endLat = '37.7765';
  const endLng = '-122.4247';
  const link = `https://www.google.com/maps/dir/${startLat},${startLng}/${endLat},${endLng}`;
  const qrCodeData = `parkingId=${parking._id}&link=${link}`;
  const qrCode = await qrcode.toDataURL(qrCodeData);

  // Render the QR code page with the new QR code
  res.render('qr', { qrCode });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
