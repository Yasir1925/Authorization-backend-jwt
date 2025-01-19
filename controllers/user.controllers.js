const User = require("../modals/user.modal");
const bcrypt = require("bcrypt");

module.exports.createUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Create token and set cookie

        const token = await newUser.generateAuthToken();  //defined in user modal
        console.log("signToken", token)
        // Create token and set cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true,
            sameSite: 'none', // For cross-origin cookies
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "Invalid credentials" });
        }
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = await existingUser.generateAuthToken();  //defined in user modal

        // Create token and set cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true
        });

        const result = {
            existingUser,
            token
        }

        res.status(200).json({ message: "Login successful", result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports.userLogout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currToken) => {
            return currToken.token !== req.token;
        });
        res.clearCookie('jwt', { path: "/" });
        await req.user.save();
        res.status(200).json({ message: "Logout Successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.validUser = async (req, res) => {
    try {
        const validuser = await User.findOne({ _id: req.user._id })
        res.status(201).json({ success: true, validuser });

    } catch (error) {
        res.status(401).json({ error: "Not a valid user" });
    }
}

module.exports.logoutUser = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currToken) => {
            return currToken.token !== req.token
        });

        res.clearCookie("")
    } catch (error) {
        res.status(401).json({ error: "Not a valid user" });

    }
}