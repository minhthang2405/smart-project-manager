// User controller
import User from '../models/User.js';

export const getUser = async (req, res) => {
    const { email } = req.params;
    const user = await User.findByPk(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
};

export const updateUser = async (req, res) => {
    try {
        const { email } = req.params;
        const update = req.body;
        
        console.log('📝 Updating user skills:', { email, update });
        
        // Validate email
        if (!email) {
            console.log('❌ No email provided');
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Find user
        const user = await User.findByPk(email);
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('✅ User found:', user.email);
        
        // Validate skill values (should be 0-10)
        const skillFields = ['frontend', 'backend', 'ai', 'devops', 'mobile', 'uxui', 'testing', 'management'];
        const validatedUpdate = {};
        
        // Only update skill fields and ensure they're valid
        for (const field of skillFields) {
            if (update[field] !== undefined) {
                const value = parseInt(update[field]);
                if (isNaN(value) || value < 0 || value > 10) {
                    console.log(`❌ Invalid skill value for ${field}:`, value);
                    return res.status(400).json({ 
                        error: `Invalid skill value for ${field}. Must be between 0 and 10.` 
                    });
                }
                validatedUpdate[field] = value;
            }
        }
        
        // Also allow updating name and avatar
        if (update.name !== undefined) validatedUpdate.name = update.name;
        if (update.avatar !== undefined) validatedUpdate.avatar = update.avatar;
        
        console.log('✅ Validated update:', validatedUpdate);
        
        // Update user
        Object.assign(user, validatedUpdate);
        await user.save();
        
        console.log('✅ User skills updated successfully:', user.toJSON());
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Skills updated successfully',
            user: user.toJSON()
        });
        
    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
