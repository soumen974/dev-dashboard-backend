const bcrypt=require('bcrypt');
const executeQuery=require('../utils/executeQuery');

const getAllDevs=async(req,res)=>{
    const query='SELECT * FROM devs';
    try{
        const rows=await executeQuery(query,[]);
        res.status(200).json(rows);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const getUserById = async (req, res) => {
    const query = 'SELECT * FROM devs WHERE id = ?';
    try {
      const rows = await executeQuery(query, [req.devs.id]);
      if (rows.length === 0) {
        return res.status(404).send(`Could not find user with id ${req.devs.id}`);
      }
      res.status(200).json(rows[0]);
    } catch (err) {
      res.status(500).send(`Error retrieving user: ${err.toString()}`);
    }
};

const updateUserById = async (req, res) => {
    const id = req.devs.id; 
    const devs = req.body;
    const updates = [];
    const params = [];
  
    if (devs.username) {
      updates.push('username = ?');
      params.push(devs.username);
    }
    if (devs.name) {
      updates.push('name = ?');
      params.push(devs.name);
    }
    if (devs.email) {
      updates.push('email = ?');
      params.push(devs.email);
    }
    if (devs.password) {
      const hashedPassword = await bcrypt.hash(devs.password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (devs.security_question) {
      updates.push('security_question = ?');
      params.push(devs.security_question);
    }
    if (devs.security_answer) {
      updates.push('security_answer = ?');
      params.push(devs.security_answer);
    }
  
    params.push(id);
  
    if (updates.length === 0) {
      return res.status(400).send('No valid fields to update');
    }
  
    const query = `UPDATE devs SET ${updates.join(', ')} WHERE id = ?`;
  
    try {
      await executeQuery(query, params);
      res.status(200).send('User updated successfully');
    } catch (err) {
      res.status(500).send(`Error updating user: ${err.message}`);
    }
  };;


module.exports={
    getAllDevs,
    getUserById,
    updateUserById
};