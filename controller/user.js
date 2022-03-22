const express = require("express");
const res = require("express/lib/response");
const router = require("express").Router();
const User = require("../models/user");
const axios = require("axios");
const uuid = require("uuid").v4;
const redis = require("redis");
const bcrypt = require("bcrypt");

const client = redis.createClient({});

client.connect();

client.on("error", (err) => {
  console.log("connection error", err.message);
});
client.on("connect", () => {
  console.log("redis is connected...");
});

router.post("/register", async (req, res, next) => {
  try {
    const phone = req.body.phone;

    if (!phone) {
      console.log("please enter filed");
      return res.status(400).json({
        success: false,
        message: "please enter filed",
      });
    } else {
      const result = {
        phone,
        code: generateRandomCode(4),
        uuid: uuid(),
      };

      const ab = await client.setEx(
        result.uuid,
        250,
        JSON.stringify(result),

        (err, reply) => {
          if (err) {
            return console.log(err.message);
          } else {
            return console.log(reply);
          }
        }
      );
      res.json({
        success: true,
        data: result,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
});

const generateRandomCode = (len, prefix = "") => {
  if (len === prefix.length) {
    return prefix;
  } else {
    return generateRandomCode(len, `${prefix}${Math.round(Math.random() * 9)}`);
  }
};

router.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;
  const id = req.body.uuid;
  const op = await client.get(id);

  const randomOtp = JSON.parse(op);

  const random = randomOtp.code;
  if (random === otp) {
    res.json({
      success: true,
      data: randomOtp,
      message: "OTP is Matched!!",
    });
  } else {
    res.json({
      success: false,
      message: "OTP is invalid",
    });
  }
});

router.post("/remaining", async (req, res) => {
  const { firstName, lastName, userName, password } = req.body;
  const id = req.body.uuid;
  if (!firstName || !lastName || !userName || !password) {
    console.log("please enter filed");
    return res.status(400).json({
      success: false,
      message: "please enter filed",
    });
  } else {
    const user = await client.get(id);
    console.log("user", user);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    console.log("user parsed : ", JSON.parse(user));
    const userData = JSON.stringify({
      ...JSON.parse(user),
      firstName,
      lastName,
      userName,
      password: hashPassword,
    });
    const ab = await client.setEx(id, 15, userData);
    console.log("ab:", ab);

    const data = await client.get(id);
    const docs = JSON.parse(data);
    console.log("docs:", docs);

    const userResult = await new User(docs).save();
    res.json({
      success: true,
      data: userResult,
    });
  }
});

module.exports = router;
