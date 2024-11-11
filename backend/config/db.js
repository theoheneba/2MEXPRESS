import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const sequelize = new Sequelize(process.env.MYSQL_URI, {
      dialect: 'mysql',
      logging: false,
    });
    await sequelize.sync();    
    await sequelize.authenticate();
    console.log(`MySQL connected: ${sequelize.config.host}`.underline.bold.cyan);
    return sequelize;
  } catch (err) {
    console.error(`Error: ${err.message}`.bold.red);
    process.exit(1);
  }
};

export default connectDB;