// src/controllers/authController.js
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Nama, email, dan password wajib diisi')
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    res.status(400)
    throw new Error('Email sudah terdaftar')
  }

  const user = await User.create({ name, email, password })

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: {
      ...user.toSafeObject(),
      token: generateToken(user._id),
    },
  })
})

// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Email dan password wajib diisi')
  }

  // password punya select:false di schema, jadi harus diminta eksplisit
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    res.status(401)
    throw new Error('Email atau password salah')
  }

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      ...user.toSafeObject(),
      token: generateToken(user._id),
    },
  })
})

// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user sudah ditempel oleh middleware protect
  res.json({
    success: true,
    data: req.user.toSafeObject(),
  })
})
