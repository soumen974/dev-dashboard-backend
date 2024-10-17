const Track = require('../models/track');

const createOrUpdateTrack = async (req, res) => {
  try {
    const username = req.devs.username; 
    const { github_id, github_token, codeforces_id, codeforces_token, codechef_id, codechef_token, hackerrank_id, hackerrank_token, leetcode_id, leetcode_token } = req.body;

    const trackData = await Track.findOneAndUpdate(
      { username },
      {
        username,
        github: { github_id, token: github_token },
        codeforces: { codeforces_id, token: codeforces_token },
        codechef: { codechef_id, token: codechef_token },
        hackerrank: { hackerrank_id, token: hackerrank_token },
        leetcode: { leetcode_id, token: leetcode_token }
      },
      { new: true, upsert: true } 
    );

    res.status(200).json({
      message: 'Track information successfully created or updated',
      track: trackData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getTrackInfo = async (req, res) => {
  try {
    const username = req.devs.username;
    const trackData = await Track.findOne({ username });

    if (!trackData) {
      return res.status(404).json({ message: 'Track information not found' });
    }

    res.status(200).json({ track: trackData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const deleteTrackInfo = async (req, res) => {
  try {
    const username = req.devs.username;
    const result = await Track.findOneAndDelete({ username });

    if (!result) {
      return res.status(404).json({ message: 'Track information not found' });
    }

    res.status(200).json({ message: 'Track information deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  createOrUpdateTrack,
  getTrackInfo,
  deleteTrackInfo
};
