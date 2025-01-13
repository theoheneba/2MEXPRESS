import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js'; 
import Staff from '../models/staffModel.js';
import generateToken from '../utils/generateToken.js';
import { sendPasswordResetEmail, sendWelcome } from '../utils/sendEmail.js';
import { sendSMSV1 } from '../utils/sendArkeselSms.js';

/**
 * @desc 		Auth user
 * @route		POST /api/users/login
 * @access	public
 */
const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ where: { email } });

	if (user && (await user.matchPassword(password))) {
		let userInfo = {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			isAdmin: user.isAdmin,
			role: user.role,
			total_points: user.total_points,
			token: generateToken(user.id),
		};

		if (user.role === 'staff') {
			const staff = await Staff.findOne({ where: { user_id: user.id } });

			if (staff) {
				userInfo = {
					...userInfo,
					staffFunctions: {
						status: staff.status,
						is_parcel_handler: staff.is_parcel_handler,
						is_ticket_handler: staff.is_ticket_handler,
						is_fleet_manager: staff.is_fleet_manager,
						is_mechanic: staff.is_mechanic,
						is_parking_attendant: staff.is_parking_attendant,
						is_manager: staff.is_manager,
						is_cleaner: staff.is_cleaner,
						is_washroom_attendant: staff.is_washroom_attendant,
						is_security: staff.is_security,
						is_general: staff.is_general,
						description: staff.description,
					},
				};
			}
		}

		res.json(userInfo);
	} else {
		res.status(401);
		throw new Error('Invalid email or password');
	}
});


/**
 * @desc 		Get user profile
 * @route		GET /api/users/profile
 * @access	private
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
	const user = await User.findByPk(req.user.id, {
		attributes: ['id', 'name', 'email', 'phone', 'role'],
	});

	if (user) {
		res.json({
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
		});
	} else {
		res.status(404);
		next(new Error('User not found'));
	}
});


/**
 * @desc 		Register new user
 * @route		POST /api/users
 * @access	public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const userExists = await User.findOne({
        where: { email: email },
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        phone,
        password,
        role,
    });

	const welcomeMessage = 'Thank you for registering with 2M Express! Your account has been created successfully.';

    await Notification.create({
        user_id: user.id,
        subject: 'Welcome!',
		message: welcomeMessage,
        type: 'info',
    });

	sendWelcome(email, welcomeMessage);

	await sendSMSV1({
		to: user.phone, 
		from: '2M Express', 
		sms: welcomeMessage,
	});

    if (user) {
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


/**
 * @desc 		Quick create a new user
 * @route		POST /api/users/quick-create
 * @access	private
 */
const quickCreateUser = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;

    const userExists = await User.findOne({
        where: { email: email },
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        phone,
        password: email,
        role: 'customer',     
    });

	const welcomeMessage = `Welcome to 2M Express! Your account has been created successfully with a default password: ${user.email}.`;

    await Notification.create({
        user_id: user.id,
        subject: 'Welcome!',
		message: welcomeMessage,
        type: 'info',
    });

	sendWelcome(email, welcomeMessage);
	
	await sendSMSV1({
		to: user.phone, 
		from: '2M Express', 
		sms: welcomeMessage,
	});

    if (user) {
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findByPk(req.body.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            user.emergencyContact = {
                name: null,
                relationship: null,
                phone: null,
                email: null,
            };

            if (req.body.emergencyContact) {
                const { name, relationship, phone, email } = req.body.emergencyContact;
                user.emergencyContact = {
                    name: name || null,
                    relationship: relationship || null,
                    phone: phone || null,
                    email: email || null,
                };
            }

            const updatedUser = await user.save();

            await Notification.create({
                user_id: updatedUser.id,
                subject: 'Profile Updated',
                message: 'Your profile has been updated successfully.',
                type: 'info',
            });

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                emergencyContact: updatedUser.emergencyContact,
                token: generateToken(updatedUser.id),
            });
        } else {
            console.log('User not found.');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**
 * @desc    Get all users or search users by name or email
 * @route   GET /api/users/
 * @access  private
 */
const getUsers = asyncHandler(async (req, res) => {
	const { search } = req.query;
	let whereCondition = {};

	if (search) {
		whereCondition = {
			[Op.or]: [
				{ name: { [Op.like]: `%${search}%` } },
				{ email: { [Op.like]: `%${search}%` } },
				{ phone: { [Op.like]: `%${search}%` } },
			],
		};
	}

	const users = await User.findAll({
		attributes: {
			exclude: ['password'],
		},
		where: whereCondition,
		order: [['created_at', 'DESC']],
	});

	res.json(users);
});


/**
 * @desc    Get all users (excluding super-admin)
 * @route   GET /api/users/admin
 * @access  private
 */
const getAdminUsers = asyncHandler(async (req, res) => {
	const { search } = req.query;
	let whereCondition = {
	  role: {
		[Op.not]: 'super-admin', 
	  },
	};
  
	if (search) {
	  whereCondition = {
		...whereCondition,
		[Op.or]: [
		  { name: { [Op.like]: `%${search}%` } },
		  { email: { [Op.like]: `%${search}%` } },
		  { phone: { [Op.like]: `%${search}%` } },
		],
	  };
	}
  
	const users = await User.findAll({
	  attributes: {
		exclude: ['password'],
	  },
	  where: whereCondition,
	  order: [['created_at', 'DESC']],
	});
  
	res.json(users);
  });
  

/**
 * @desc 		Delete user
 * @route		DELETE /api/users/:id
 * @access	private
 */
const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findByPk(req.params.id);

	if (user) {
		await user.destroy();
		res.status(204).end();
	} else {
		res.status(404).json({ message: 'User not found' });
	}
});


/**
 * @desc 		Get user by ID
 * @route		GET /api/users/:id
 * @access	private
 */
const getUserByID = asyncHandler(async (req, res) => {
	const userId = req.params.id;
	const user = await User.findByPk(userId, {
		attributes: { exclude: ['password'] },
	});

	if (user) {
		res.json(user);
	} else {
		res.status(404).json({ message: 'User not found' });
	}
});


/**
 * @desc 		Update a user
 * @route		PUT /api/users/:id
 * @access	private
 */
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findByPk(req.params.id);

	if (user) {
		user.name = req.body.name || user.name;
		user.email = req.body.email || user.email;
		user.phone = req.body.phone || user.phone;
		user.isAdmin = req.body.isAdmin;
		user.role = req.body.role || user.role;

		if (req.body.password) {
			user.password = req.body.password;
		}

		const updatedUser = await user.save();

		res.json({
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			phone: updatedUser.phone,
			role: updatedUser.role,
			isAdmin: updatedUser.isAdmin,
			token: generateToken(updatedUser.id),
		});
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});


/**
 * @desc    Forgot password
 * @route   POST /api/users/forgot-password
 * @access  public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const defaultPassword = `${user.phone}@2M`;

    user.password = defaultPassword;
    await user.save();

    sendPasswordResetEmail(email, defaultPassword);

    res.status(200).json({ message: 'Password reset email sent successfully' });
});


export {
	authUser,
	getUserProfile,
	registerUser,
	quickCreateUser,
	updateUserProfile,
	getUsers,
	getAdminUsers,
	deleteUser,
	getUserByID,
	updateUser,
	forgotPassword,
};
