const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Devs = require('../models/devs');

exports.registerUser = async (devData) => {
    const { username, name, email, password, security_question, security_answer } = devData;

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(security_answer, 10);

    const dev = new Devs({
        username,
        name,
        email,
        password: hashedPassword,
        security_question,
        security_answer: hashedSecurityAnswer,
    });

    await dev.save();
    return dev;
};

exports.verifyUser = async (email, password) => {
    const dev = await Devs.findOne({ email });
    if (!dev) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, dev.password);
    if (!isMatch) throw new Error('Invalid email or password');

    const token = jwt.sign({ id: dev._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};
