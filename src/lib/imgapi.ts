import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import {uploadImage} from '../imgs/img.js'
import { getImagesByEventSlug, insertEventImage } from './db.js';

export async function addImage(req:Request,res:Response,next:NextFunction){
    const {slug} = req.params;
    const {name, url} = req.body;
    try{
        const result = await uploadImage(url,name);
        console.error(result);
        const insert = await insertEventImage(slug,name,result.url);
        return res.status(200).json(insert);    
    }catch{
        return res.status(500)
    }
}
export async function getImages(req:Request,res:Response,next:NextFunction){
    const {slug} = req.params;
    const result = await getImagesByEventSlug(slug);
    if(!result){
        return next();
    }
    return res.status(200).json(result);
    
}