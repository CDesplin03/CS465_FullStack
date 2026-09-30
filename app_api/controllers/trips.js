const mongoose = require('mongoose');
const Trip = require('../models/travlr');
const Model = mongoose.model('Trip');

// Get /trips for full list of trips
const tripsList = async(req, res) => {
    const q = await Model
        .find({})
        .exec();

    if(!q)
    {
        // No data returned
        return res
                .status(404)
                .json(err);
    } 
    else 
    {
        // Return resulting trips
        return res
            .status(200)
            .json(q);
    }
};

const tripsFindByCode = async(req, res) => {
    const q = await Model
        .find({'code' : req.params.tripCode }) // Return Single Record
        .exec();

    if(!q)
    {
        // No data returned
        return res
                .status(404)
                .json(err);
    }  
    else 
    {
        // Return resulting trips
        return res
            .status(200)
            .json(q);
    }
};
module.exports = {
    tripsList,
    tripsFindByCode
};