import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  if(!process.env.JWT_SECRET){
    console.error("JWT not set in env");
    return "error";
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

export const verifyToken = (token: string) => {
  if(!process.env.JWT_SECRET){
    console.error("JWT not set in env");
    return;
  }
  console.log("Token to verify:", token);
  return jwt.verify(token, process.env.JWT_SECRET);
}; 