import colors from 'colors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import { CronJob } from 'cron';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import busRoutes from './routes/busRoutes.js'; 
import contactRoutes from './routes/contactRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import fleetManagementRoutes from './routes/fleetManagementRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import parcelRoutes from './routes/parcelRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js'
import routeRoutes from './routes/routeRoutes.js'; 
import serviceHistoryRoutes from './routes/serviceHistoryRoutes.js';
import servicingInventoryRoutes from './routes/servicingInventoryRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import washroomRoutes from './routes/washroomRoutes.js';
import { checkLicenseExpiry } from './controllers/driverController.js';


dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use('/api/buses', busRoutes); 
app.use('/api/contactus', contactRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/fleet_management', fleetManagementRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/service-histories', serviceHistoryRoutes);
app.use('/api/servicing-inventory', servicingInventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/uploads', uploadRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/washrooms', washroomRoutes);


const __dirname = path.resolve();

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(favicon(path.join(__dirname, 'client', 'dist', 'logo.png')));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running');
    });
}

app.use(notFound);
app.use(errorHandler);

const dailyLicenseCheckJob = new CronJob('0 0 * * *', async () => {
    console.log('Running daily license expiry check...');
    try {
        await checkLicenseExpiry();
    } catch (error) {
        console.error('Error checking license expiry:', error);
    }
}, null, true, 'GMT'); 

dailyLicenseCheckJob.start();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}.`.bold.yellow
    );
});
