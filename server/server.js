/*const PORT = process.env.PORT ?? 8000;
const express = require("express");
const app = express();
const db = require("./database");*/
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const app = express();
const PORT = 8000;

const db = new pg.Client({
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.DBPORT
});
db.connect();

app.use(cors());
app.use(express.json());

//get za zadatke
app.get("/zadaci/:userEmail", async (req, res) => {

  const { userEmail } = req.params;


  try {
    const result = await db.query("SELECT * FROM zadaci WHERE user_email=$1", [userEmail])
    res.json(result.rows);
  } catch (err) {
    console.log(err);
  }
})

//stvori novi zadatak
app.post("/zadaci", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  console.log(user_email, title, progress, date)

  try {
    const newTask = await db.query("INSERT INTO zadaci(user_email, title, progress, date) VALUES ($1, $2, $3, $4)",
      [user_email, title, progress, date]);
    res.json(newTask);
  } catch (err) {
    console.log(err);
  }
})

//izmijeni zadatak 
app.post("/zadaci/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {
    const editedTask = await db.query("UPDATE zadaci SET user_email=$1, title=$2, progress=$3, date=$4 WHERE id = $5;",
      [user_email, title, progress, date, id]);
    res.json(editedTask);
  } catch (err) {
    console.log(err);
  }
})

//izbrisi zadatak
app.post("/zadaci/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await db.query("DELETE FROM zadaci WHERE id = $1;",
      [id]);
    res.json(deletedTask);
  } catch (err) {
    console.log(err);
  }
})

//signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const saltRounds = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  try {
    const signedUser = await db.query("INSERT INTO users (email, hashed_password) VALUES ($1, $2)",
      [email, hashedPassword]);

    const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });
    res.json({ email, token });
  } catch (err) {
    console.log(err);
    if (err) {
      res.json({ detail: err.detail })
    }
  }
})

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await db.query("SELECT * FROM users WHERE email =$1", [email]);

    if (!users.rows.length) return res.json({ detail: 'User does not exist!' });

    const success = await bcrypt.compare(password, users.rows[0].hashed_password);
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });

    if (success) {
      res.json({ 'email': users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed!" });
    }

  } catch (err) {
    console.log(err);
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));