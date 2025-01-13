import colors from 'colors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import usersData from './data/users.js';
import User from './models/userModel.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();       
        
        await User.destroy({ where: {} });

        await User.bulkCreate(usersData, { individualHooks: true });
       
        console.log('Data imported successfully.'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();

        await User.destroy({ where: {} });

        console.log('Data destroyed successfully.'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    seedDatabase();
}
