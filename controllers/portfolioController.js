// controllers/portfolioController.js

const Portfolio = require('../models/portfolio');
const Devs = require('../models/devs');

const createPortfolio = async (req, res) => {
  try {
    const { personal_data, recent_experience, projects, services, licenses_and_certifications } = req.body;
    
    const { devId } = req.devs.id;

    // Ensure the devId exists
    const devExists = await Devs.findById(devId);
    if (!devExists) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    const newPortfolio = new Portfolio({
      dev: devId,
      personal_data,
      recent_experience,
      projects,
      services,
      licenses_and_certifications
    });

    const savedPortfolio = await newPortfolio.save();
    res.status(201).json({ message: 'Portfolio created successfully', portfolio: savedPortfolio });
  } catch (error) {
    res.status(500).json({ message: 'Error creating portfolio', error });
  }
};

const getPortfolioByDevId = async (req, res) => {
  try {
    const { devId } = req.devs.id;

    const portfolio = await Portfolio.findOne({ dev: devId }).populate('dev');
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error });
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const { devId } = req.devs.id;
    const updates = req.body;

    const updatedPortfolio = await Portfolio.findOneAndUpdate({ dev: devId }, updates, { new: true });
    if (!updatedPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).json({ message: 'Portfolio updated successfully', portfolio: updatedPortfolio });
  } catch (error) {
    res.status(500).json({ message: 'Error updating portfolio', error });
  }
};

const deletePortfolio = async (req, res) => {
  try {
    const { devId } = req.devs.id;

    const deletedPortfolio = await Portfolio.findOneAndDelete({ dev: devId });
    if (!deletedPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting portfolio', error });
  }
};

module.exports = { deletePortfolio, updatePortfolio, getPortfolioByDevId, createPortfolio };
