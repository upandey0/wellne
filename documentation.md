Introduction

This document describes how Role-Based Access Control (RBAC) has been implemented in the WellnessZ Client Management System. The system has two main user roles: Admin and Coach. These roles are used to control access to various API endpoints and restrict actions based on the user's role.
Roles in the System

    Admin:
        Admin users have full access to the system.
        Admin can manage both clients and coaches.
        Admin can delete clients, create coaches, and update the dashboard.

    Coach:
        Coach users can only manage their own clients.
        Coaches can create new clients, update progress, and view their clients' information.
        Coaches cannot delete clients or access the data of other coaches' clients.

Role-Based Access Implementation
1. Authentication Middleware

The authentication middleware is used to verify if a user is authenticated by checking their JWT (JSON Web Token). This ensures that only authorized users can access the protected routes.

The authentication middleware is implemented as follows in services/roleMiddleware.js:

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = { authMiddleware };

This middleware decodes the JWT token, verifies its validity, and extracts the user information (excluding the password). The user object is then attached to the req object for further use in the route handlers.
2. Role Middleware

Role-based access control is handled by the roleMiddleware function, which checks whether the authenticated user has the required role to access a specific endpoint.

const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

module.exports = { roleMiddleware };

This middleware checks if the user’s role matches one of the allowed roles. If the user’s role does not match, they are denied access with a 403 Forbidden error.
3. Role Assignment to Users

Roles are assigned when creating users. Admins are assigned the role admin, and coaches are assigned the role coach. This assignment occurs when creating the user in the database.

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['admin', 'coach'], default: 'coach' },
});

4. Protecting Routes with Role-Based Access

The authMiddleware and roleMiddleware are applied to routes to enforce role-based access control. Here's how role-based restrictions are applied to routes in routes/clientRoutes.js:
Example: Creating a Client

Only admins and coaches can create clients. Coaches can only assign clients to themselves.

router.post(
    '/clients',
    authMiddleware, // Ensure the user is authenticated
    roleMiddleware(['admin', 'coach']), // Ensure the user is an admin or a coach
    clientController.createClient // Execute the controller logic
);

Example: Deleting a Client

Only admins can delete clients.

router.delete(
    '/clients/:id',
    authMiddleware, // Ensure the user is authenticated
    roleMiddleware(['admin']), // Ensure the user is an admin
    clientController.deleteClient // Execute the controller logic
);

5. Role-Specific Logic in Controllers

Controllers have logic to ensure that users can only perform actions related to their own data or assigned roles.
Example: Getting Clients for a Coach

In clientController.js, the following logic ensures that coaches can only access clients assigned to them.

const getClientsForCoach = async (req, res) => {
    const { coachId } = req.params;

    // If the user is a coach, they can only see their own clients
    if (req.user.role === 'coach' && coachId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only view your own clients' });
    }

    const clients = await Client.find({ coachId }).populate('coachId', 'name email');
    res.status(200).json({ clients });
};

This logic checks if the coachId in the request matches the logged-in user's ID. Coaches can only view their own clients, and admins can view all clients.
6. API Testing

You can test the role-based access by using tools like Postman or Insomnia.

    Admin User: Login as an admin and test routes like:
        POST /api/coaches: Create a new coach.
        DELETE /api/clients/:id: Delete a client.
    Coach User: Login as a coach and test routes like:
        POST /api/clients: Create clients for their own coaching.
        PATCH /api/clients/:id/progress: Update client progress for their own clients.
        GET /api/coaches/:coachId/clients: View their own clients.