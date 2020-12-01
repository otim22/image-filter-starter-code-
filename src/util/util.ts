import fs from 'fs';
import Jimp = require('jimp');
var Path = require('path');
import Axios from 'axios';
import * as AWS from './../aws';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';
import { Request, Response } from 'express';
import { config } from '../config/config';
import {Auth} from '../controllers/images/models/Image';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img)=>{
            resolve(__dirname+outpath);
        });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

/*export async function getImageBuffer(inputURL: string): Promise<Buffer>{
    return new Promise(async imgBuffer =>{
        const img = await Jimp.read(inputURL);
        await img.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
            console.log(buffer);
            imgBuffer(buffer);
        });
    });
}*/

export async function uploadImageToS3Bucket(filePath: string): Promise<String>{
    return new Promise(async imgKey =>{
        var key = Path.basename(filePath);
        //console.log(key);
        const file = fs.readFileSync(filePath);
        const axios = Axios.create();
        const url = AWS.getPutSignedUrl(key);
        const config = {
            onUploadProgress: function(progressEvent: any) {
                var percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
            console.log(percentCompleted);
            },
             header: {
            'Content-Type': 'multipart/form-data'
            }
        };
    
        axios.put(url, file, config)
        .then(async res => {
            //callback({res, key})
            console.log(res.status);
            imgKey(key);
        })
        .catch(err => {
            console.log(err);
        });
    });
}

/*export type Auth = {
    generalAuthID: string;
};*/
export function generateJWT(authID: Auth): string {
    //Use jwt to create a new JWT Payload containing
    return jwt.sign(authID, `${config.jwt.secret}`);
}

//This function is a middleware 
export function requireAuth(req: Request, res: Response, next: NextFunction) {

    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    // eg of a token brearer looks like this 'Bearer fbfbkdbfkjdjdfjdhdddd'
    const token_bearer = req.headers.authorization.split(' '); //we are sending a bearer token as the type of authentication using postman or a front-end framework
    if(token_bearer.length != 2){
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    const token = token_bearer[1];

    return jwt.verify(token, `${config.jwt.secret}`, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
        }
       return next();
    });
}