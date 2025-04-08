import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, firstName: user.firstName }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );
};
