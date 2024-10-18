const service = require('../models/services');

const createService = async (req, res) => {
    try {
        const newService = new service({
        ...req.body,
        username: req.devs.username 
        });
    
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getServices = async (req, res) => {
    try {
        const services = await service.find({ username: req.devs.username });
        
        res.status(200).json(services);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

const updateService = async (req, res) => {
    try {
        const { id} = req.params;
        const {title,description} = req.body;

        const Service = await service.findOne( {_id:id ,username: req.devs.username} );
        if(!Service) return res.status(404).send('No service found');

        if(title) Service.title = title;
        if(description) service.description = description;

        const updatedService = await service.save();
        res.status(200).json(updatedService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const deleteService = async (req, res) => {
    try {
        const service = await service.findOneAndDelete({
            _id: req.params.id, 
            username: req.devs.username 
        });

        if(!service) return res.status(404).send('No service found');


        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { createService, getServices, updateService, deleteService };