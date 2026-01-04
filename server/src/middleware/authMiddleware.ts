  import jwt from 'jsonwebtoken'
  import { Request, Response, NextFunction } from "express";

  interface JwtPayload {
    id: string
  }

  const verifyToken = (request: Request, response:Response, next: NextFunction): void => {
    // 1.get the token
    const token = request.headers.authorization?.split(" ")[1];
    // 2. if not token, throw error
    if (!token){
      response.status(401).json("Access Denied. No Token Provided");
      return;
    }

    // 3. verify if the token is distributed by our server
    try{

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined');
      }
      // 4. if the token is legit, then put it in response.user

      // 5.next to the route
      const verifiedResult = jwt.verify(token!, process.env.JWT_SECRET) as JwtPayload;
      request.user = verifiedResult;
      next();

    } catch(error) {
      response.status(403).json({ error: "Invalid Token" })
    }
  };

export default verifyToken