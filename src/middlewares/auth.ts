import * as jwt from "jsonwebtoken";
import * as _ from "lodash";
import moment = require("moment");

export function _createJWToken(sessionDetails: any) {
  if (typeof sessionDetails !== "object") {
    sessionDetails = {};
  }
  return jwt.sign(
    {
      data: sessionDetails,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1 day",
      algorithm: "HS256",
    }
  );
}

export function _verifyJWTToken(token: any) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err: any, decodedToken: any) => {
      if (err || !decodedToken) {
        return reject(err);
      }
      resolve(decodedToken);
    });
  });
}

/**
 * @param  {string} token
 * @returns {Object} - user basic information
 */
export const getSessionTokenData = async (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    resolve(decoded.data);
  });
};