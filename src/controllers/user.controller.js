import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import JWT from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    
    try {
        const user = await User.findById(userId);
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: true });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.");
    }
};

const registerUser = asyncHandler( async(req, res) => {
    // get user details from frontend
    // validation - not empty etc...
    // check if user already exists: username, email
    // check for images, avatar
    // upload to cloudinary, avatar check
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response

    const {username, email, fullName, password} = req.body

    if ([username, email, fullName, password].some(
        (field) => ( field?.trim() === "" )
    )) {
        throw new ApiError(400, "All fields are required")
    }

    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (userExists) throw new ApiError(409, "user with username or email already exists")

    // console.log("req.files", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log("avatarLocalPath", avatarLocalPath);

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath).catch((error) => console.log(error))
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log(avatar);null
    if (!avatar) throw new ApiError(400, "Avatar file is required!!!.")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new ApiError(500, "user registration failed, please try again")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

});

const loginUser = asyncHandler(async(req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send tokens in cookies

    const {email, username, password} = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required.");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User doesnot exist.");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully !!!."
            )
        );

});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logout successfull !!!."
            )
        );
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    const user = await User.findOne({
        refreshToken: incomingRefreshToken
    });

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        )

});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}