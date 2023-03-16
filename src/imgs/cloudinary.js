// Or use require() in node

// Or use type===module in package.json

import {Cloudinary} from '@cloudinary/url-gen'
import {Resize} from '@cloudinary/url-gen/actions'



const cldInstance = new Cloudinary({cloud: {cloudName: 'djyeixsel'}});



// Fetch images from the web without uploading them

const fetchedImage = cldInstance
  .image('https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg')
  .setDeliveryType('fetch');

console.log(fetchedImage.toURL());
// https://res.cloudinary.com/<cloud_name>/image/fetch/https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg




// Transform

const myImage = cldInstance
  .image('https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg')
  .setDeliveryType('fetch')
  .resize(Resize.fill().width(100).height(150))



console.log(myImage.toURL());
"https://res.cloudinary.com/<cloud_name>/image/fetch/c_fill,h_150,w_100/https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg"