import util from 'util';
import {readFile}from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config();
console.log(cloudinary.config().cloud_name);



const resourcesAsync = util.promisify(cloudinary.api.resources);
const uploadAsync = util.promisify(cloudinary.uploader.upload);

const CLOUDINARY_MAX_RESULTS = 100;

let cachedListImages = null;
/*
export async function addImage(name,url,event){


}
export async function getImage(name,event){

}*/

export async function listImages() {
  if (cachedListImages) {
    return Promise.resolve(cachedListImages);
  }

  let nextCursor;
  const resources = [];

  do {
    const query = { max_results: CLOUDINARY_MAX_RESULTS };

    if (nextCursor) {
      query.next_cursor = nextCursor;
    }

    // eslint-disable-next-line no-await-in-loop
    const res = await resourcesAsync(query);

    nextCursor = res.next_cursor;

    resources.push(...res.resources);
  } while (nextCursor);

  cachedListImages = resources;

  return resources;
}
export const uploadImage = async (imagePath,name) => {

  // Use the uploaded file's name as the asset's public ID and 
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    console.log(result);
    return result.public_id;
  } catch (error) {
    console.error(error);
  }
};


uploadImage('./pics/oat-milk.jpg',"oat");
const result = cloudinary
  .image('oat-milk.jpg');