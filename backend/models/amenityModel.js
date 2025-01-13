import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const Amenity = sequelize.define(
    'Amenity', 
    {  
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        washroom_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,            
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },        
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM,
            values: ['available', 'unavailable', 'under_maintenance', 'coming_soon', 'out_of_service', 'cleaning'],
            allowNull: true,
            defaultValue: 'available',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, 
    {
        tableName: 'amenities',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

await Amenity.sync();

export default Amenity;
