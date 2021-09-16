const express = require('express');
const app = express.Router();
const shortid = require('shortid');
const Url = require('../models/Url');
const isReachable = require('is-reachable');
//@route    POST /api/url/shorten
//@desc     Create short URL

const baseUrl = 'http:localhost:5000';
app.post('/shorten', async (req, res) => {
    try{
        const {longUrl} = req.body;
        console.log(req)
        //check base url
        if (!await isReachable(baseUrl)) {
            return res.status(401).json('Invalid base URL');
        }
        var response = {}
        await Promise.all(
            longUrl.map(async (data) => {
                // create url code
                let longUrl = data
                const urlCode = shortid.generate();
                console.log(longUrl)
                //check long url
                let validUrl =  req.body.longUrl.length > 1 ? isReachable(longUrl) : await isReachable(longUrl)
                if (validUrl) {
                    try {
                        let url = await Url.findOne({ "longUrl": longUrl });
                        if (url) {
                            console.log("url", url);
                            // res.json(url);
                            return url;
                        }
                        else {
                            const shortUrl = baseUrl + '/' + urlCode;
                            url = {
                                valid: true,
                                longUrl,
                                shortUrl,
                                urlCode,
                                date: new Date()
                            }
                            await Url.insertMany(url);
                            // res.json(url);
                            return url;
                        }
                    }
                    catch (error) {
                        console.log(error);
                        res.status(500).json({success: false, message: "Internal Server Error"});
                    }
                }
                else {
                    // res.status(401).json('Invalid longUrl');
                    response = {valid: false, longUrl: longUrl}
                    return response
                }
            })
        )
        .then(async (responseData) => {
           // console.log(responseData)
            res.json(responseData)
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
})

module.exports = app
