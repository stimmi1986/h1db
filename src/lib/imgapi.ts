import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import {uploadImage} from '../imgs/img.js'

export async function addImage(req:Request,res:Response,next:NextFunction){
    const {slug} = req.params;
    const {name, url} = req.body;
    try{
        const result = await uploadImage(url,name);
        console.error(result);
        return res.status(200);    
    }catch{
        return res.status(500)
    }
}