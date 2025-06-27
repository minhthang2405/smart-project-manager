// User controller
import User from '../models/User.js';

export const getUser = async (req, res) => {
    const { email } = req.params;
    const user = await User.findByPk(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
};

export const updateUser = async (req, res) => {
    const { email } = req.params;
    const update = req.body;
    const user = await User.findByPk(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, update);
    await user.save();
    res.json(user);
};
