import express from 'express';
import { db } from '@repo/db/';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { signupSchema  , signinSchema  , createRoomSchema } from '@repo/common';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post("/signup" , async (req , res) => {
  const { email, password } = signupSchema.parse(req.body);
  const user = await db.user.create({
    data : {
      email ,
      password
    }
  });

  const token = jwt.sign({
    userId: user.id
  }, process.env.JWT_SECRET || 'fallback-secret-key');

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email
    }
  });
});

app.post("/signin" ,async   (req , res) => {
  const { email, password } = signinSchema.parse(req.body);
  const user = await db.user.findUnique({
    where : {
      email
    }
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({
    userId: user.id
  }, process.env.JWT_SECRET || 'fallback-secret-key');

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email
    }
  });
});

app.post("/room" , middleware, async (req , res) => {
  const { name } = createRoomSchema.parse(req.body);
  const room = await db.room.create({
    data : {
      name : name
    }
  });
  res.json(room);
})


app.listen(3000, () => {
  console.log('HTTP server is running on port 3000');
});