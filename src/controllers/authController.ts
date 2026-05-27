import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import sendEmail from '../utils/sendEmail';
import { getForgotPasswordEmailTemplate } from '../utils/emailTemplates';

const generateToken = (id: string, name: string, email: string) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, statusCode: 400, message: 'User already exists' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });
    if (user) {
      // Check if this new user was invited to any boards
      try {
        const Board = (await import('../models/Board')).default;
        const invitedBoards = await Board.find({ invitedEmails: email.toLowerCase() });
        for (const board of invitedBoards) {
          board.sharedWith.push(user._id);
          board.invitedEmails = board.invitedEmails.filter(e => e !== email.toLowerCase());
          await board.save();
        }
      } catch (inviteErr) {
        console.error('Error processing board invites during registration:', inviteErr);
      }

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id.toString(), user.name, user.email),
        }
      });
    } else {
      res.status(400).json({ success: false, statusCode: 400, message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        success: true,
        statusCode: 200,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id.toString(), user.name, user.email),
        }
      });
    } else {
      res.status(401).json({ success: false, statusCode: 401, message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const updateProfile = async (req: Request | any, res: Response): Promise<void> => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, statusCode: 404, message: 'User not found' });
      return;
    }
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      statusCode: 200,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id.toString(), user.name, user.email) // token might not need avatar, but just in case
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ success: false, statusCode: 404, message: 'There is no user with that email' });
      return;
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Generate HTML template
    const htmlTemplate = getForgotPasswordEmailTemplate(user.name, resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
        html: htmlTemplate
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Password reset email sent successfully.'
      });
    } catch (emailError) {
      // If email fails, clear the reset token so they can try again
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Error sending reset email:', emailError);
      res.status(500).json({ success: false, statusCode: 500, message: 'Email could not be sent' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const crypto = await import('crypto');
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken as string).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ success: false, statusCode: 400, message: 'Invalid or expired reset token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};
