import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const Newsletter = sequelize.define(
    'NewsletterSubscriber',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            unsigned: true,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'newsletter_subscribers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Newsletter.sync();

export default Newsletter;
