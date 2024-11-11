import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import Newsletter from './newsletterModel.js';
import User from './userModel.js';

const sequelize = await connectDB();

const NewsletterMessage = sequelize.define(
    'NewsletterMessage',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            unsigned: true,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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
        tableName: 'newsletter_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

NewsletterMessage.belongsToMany(Newsletter, {
    through: 'MessageRecipient', 
    foreignKey: 'messageId',
    otherKey: 'subscriberId',
    as: 'sentToSubscribers',
});


NewsletterMessage.belongsTo(User, {
    foreignKey: 'sentByUserId',
    as: 'sentByUser',
});

NewsletterMessage.sync();

export default NewsletterMessage;
