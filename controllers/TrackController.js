const Track = require('../models/track');

const createOrUpdateTrack = async (req, res) => {
  try {
    const { username } = req.devs; 
    const { 
      github_id, github_token, 
      codeforces_id, codeforces_token, 
      codechef_id, codechef_token, 
      hackerrank_id, hackerrank_token, 
      leetcode_id, leetcode_token 
    } = req.body;

    const trackData = await Track.findOneAndUpdate(
      { username },
      {
        username, // Ensure the username is set in case of upsert
        github_id,
        github_token,
        codeforces_id,
        codeforces_token,
        codechef_id,
        codechef_token,
        hackerrank_id,
        hackerrank_token,
        leetcode_id,
        leetcode_token
      },
      { new: true, upsert: true, runValidators: true }
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

    res.status(200).json( trackData );
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
// const { username } = req.params;

const getTrackInfoPublic = async (req, res) => {
  try {
    const { username } = req.params;
    const trackData = await Track.findOne({ username }).select('-_id -username -__v -createdAt -updatedAt');

    if (!trackData) {
      return res.status(404).json({ message: 'Track information not found' });
    }

    res.status(200).json( trackData );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


module.exports = {
  getTrackInfoPublic,
  createOrUpdateTrack,
  getTrackInfo,
  deleteTrackInfo
};
