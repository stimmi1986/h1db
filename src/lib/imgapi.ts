import { Request, Response, NextFunction, query } from 'express';
import jwt from "jsonwebtoken";
import {uploadImage} from '../imgs/img.js'
import { addImageToDatabase, allImages, deleteFullyImageByName, deleteImageFromEvent, getEventBySlug, getImagesByEventSlug, getSpecificImageByName, insertEventImage, putEventImage } from './db.js';
import slugify from 'slugify';

export async function addImage(req:Request,res:Response,next:NextFunction){
    const {name, url} = req.body;
    try{
        const exists = await getSpecificImageByName(slugify(name).toLowerCase());
        if(exists){
            return res.status(406).json('Mynd með þessu nafni er þegar til')
        }
        const result = await uploadImage(url,name);
        if(!result){
            return res.status(500).json('vandamál með cloudify.');
        }
        const save = await addImageToDatabase(slugify(name).toLowerCase(),result.url);
        if(!save){
            return res.status(500).json('vandamál með gagnagrunn');
        }
        return res.status(200).json(save);    
    }catch{
        return res.status(500)
    }
}
export async function addImageToEvent(req:Request,res:Response,next:NextFunction){
    const {slug} = req.params;
    const {name} = req.body;
    const image = await getSpecificImageByName(slugify(name).toLowerCase());
    const event = await getEventBySlug(slug);
    if(!event){
        return res.status(404).json('viðburður með þessu nafni er ekki í kerfinu')
    }
    if(!image){
        return res.status(404).json('mynd með þessu nafni er ekki í kerfinu');
    }
    const ret = await putEventImage(image,event);
    if(!ret){
        return res.status(500).json('ekki tókst að tengja mynd við viðburð');
    }
    return res.status(201).json([event,image]);
}
export async function getEventImage(req:Request,res:Response,next:NextFunction){
    const {slug,image} = req.params;
    const img = await getSpecificImageByName(image);
    console.error(img);
    const event = await getImagesByEventSlug(slug);
    console.error(event);
    if(!img){
        return res.status(404).json('mynd með þessu nafni er ekki til');
    }
    for(const ev of event){
        if(ev.id === img.id){
            return res.status(200).json(img);
        }
    }return res.status(403).json('þessi mynd er til en tilheyrir ekki þessum viðburði');
}
export async function getEventImages(req:Request,res:Response,next:NextFunction){
    const {slug} = req.params;
    const result = await getImagesByEventSlug(slug);
    if(!result){
        return next();
    }
    return res.status(200).json(result);
    
}
export async function removeImageFromEvent(req:Request,res:Response,next:NextFunction){
    const {slug,image} = req.params;
    const img = await deleteImageFromEvent(image,slug);
    if(!img){
        return res.status(404).json('Þessi mynd var ekki tengd við þennan viðburð');
    }
    return res.status(200).json('mynd eytt af viðburði');
}
export async function getImage(req:Request,res:Response,next:NextFunction){
    const {image} = req.params;
    const img = await getSpecificImageByName(image);
    if(!img){
        return next();
    }
    return res.status(200).json(img);
}
export async function getImages(req:Request,res:Response,next:NextFunction){
    const images = await allImages();
    return res.status(200).json(images);
}
export async function deleteImage(req:Request,res:Response,next:NextFunction){
    const {image} = req.params;
    const {token} = req.body;
    if(!token){
        return res.status(401).json("ekkert signin token");
    }
    const dec = jwt.decode(token) as {admin};
    if(!dec.admin){
        return res.status(401).json("notandi hefur ekki heimild til að gera þetta");
    }
    const del = await deleteFullyImageByName(image);
    if(!del){
        return next();
    }
    return res.status(200).json('Mynd eytt')

}
