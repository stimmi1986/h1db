const cloudinary = require('cloudinary').v2;


// Configuration 
cloudinary.config({
  cloud_name: "drszg8xkh",
  api_key: "572778444959772",
  api_secret: "r9blsexb-DssPFwOa7hAM7POAVA"
});
const res = cloudinary.uploader.upload('https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg', {public_id: "olympic_flag"})

res.then((data) => {
  console.log(data);
  console.log(data.secure_url);
}).catch((err) => {
  console.log(err);
});


// Generate 
const url = cloudinary.url("olympic_flag", {
  width: 100,
  height: 150,
  Crop: 'fill'
});



// The output url
console.log(url);