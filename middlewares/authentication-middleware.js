import jwt from "jsonwebtoken";
import ResponseHelper from "../helpers/response-helper.js";
import AuthRepository from "../modules/auth/auth-repository.js";

class AuthMiddleware {
  /**
   * Middleware for authenticating users using JWT Access Token.
   */
  static async authenticate(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ResponseHelper.error(res, "Authentication failed. No token provided.", 401);
    }

    try {
      // Verify Access Token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;

      // Check if the token is blacklisted
      const isBlacklisted = await AuthRepository.isTokenBlacklisted(token);
      const allTokensBlacklisted = await AuthRepository.isAllTokensBlacklisted(decoded.id);

      if (isBlacklisted || allTokensBlacklisted) {
        return ResponseHelper.error(res, "Authentication failed. Token is blacklisted.", 401);
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return ResponseHelper.error(res, "Access token expired. Please refresh your token.", 401);
      }
      return ResponseHelper.error(res, "Authentication failed. Invalid token.", 401);
    }
  }

  /**
   * Role-based access control middleware.
   * @param  {...any} allowedRoles
   */
  static authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user?.role;

      if (!allowedRoles.includes(userRole)) {
        return ResponseHelper.error(res, "Access denied. Insufficient permissions.", 403);
      }

      next();
    };
  }

  /**
   * Verify Refresh Token and issue a new Access Token.
   */
  static async verifyRefreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHelper.error(res, "No refresh token provided.", 400);
    }

    try {
      // Verify Refresh Token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if the refresh token is blacklisted
      const isBlacklisted = await AuthRepository.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        return ResponseHelper.error(res, "Refresh token is blacklisted.", 401);
      }

      // Issue new Access Token
      const newAccessToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" } // Short-lived access token
      );

      return ResponseHelper.success(res, "New access token issued.", {
        accessToken: newAccessToken,
      });
    } catch (error) {
      return ResponseHelper.error(res, "Invalid or expired refresh token.", 401);
    }
  }
}

export default AuthMiddleware;
