import util from 'util';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { cldInstance } from './cloudinary.js';

dotenv.config();
cloudinary.config({cloud_name: process.env.cloud_name});
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

export async function uploadImage(filepath,name) {
  return uploadAsync.upload(filepath,
    {resource_type:"image",name:name})
    .then((result) => {
    
    console.log("success",JSON.stringify(result,null,2))})
    .catch((error) =>{
      console.log("error",JSON.stringify(error,null,2))
    });
}