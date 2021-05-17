import HelperUtils from '../utils/helperUtils';
import DB from '../database/dbconnection';

/**
 * @class ValidateUser
 * @description Intercepts and validates a given request for User endpoints
 * @exports ValidateUser
 */
export default class ValidateUser {
  /**
   * @method validateProfileDetails
   * @description Validates profile details of user upon registration
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @returns
   */
  static validateProfileDetails(req, res, next) {
    req
      .checkBody('firstname').notEmpty()
      .withMessage('First name is required')
      .trim()
      .isLength({ min: 3, max: 15 })
      .withMessage('First name should be between 3 to 15 charcters')
      .isAlpha()
      .withMessage('First name should only contain alphabets');
    req
      .checkBody('lastname').notEmpty()
      .withMessage('Last name is required')
      .trim()
      .isLength({ min: 3, max: 15 })
      .withMessage('Last name should be between 3 to 15 charcters')
      .isAlpha()
      .withMessage('Last name should only contain alphabets');
    req
      .checkBody('address').notEmpty()
      .withMessage('Address field is required')
      .trim()
      .isLength({ min: 10, max: 50 })
      .withMessage('Address should be between 10 to 50 characters')
      // eslint-disable-next-line no-useless-escape
      .matches(/^[A-Za-z0-9\.\-\s\,]*$/)
      .withMessage('Invalid address format entered');
    req
      .checkBody('email').notEmpty()
      .withMessage('Email field is required')
      .trim()
      .isEmail()
      .withMessage('Invalid email address entered')
      .customSanitizer(email => email.toLowerCase());
    req
      .checkBody('password').notEmpty()
      .withMessage('Password is required')
      .trim()
      .isLength({ min: 6, max: 15 })
      .withMessage('Password must be between 6 to 15 characters');
    const errors = req.validationErrors();
    if (errors) {
      res.status(400).json({ status: 400, error: errors[0].msg });
      return;
    }
    next();
  }

  /**
   * @method validateLoginDetails
   * @description Validates login details (email and password)
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @returns
   */
  static async validateLoginDetails(req, res, next) {
    req
      .checkBody('email').notEmpty()
      .withMessage('Email field is required')
      .trim()
      .isEmail()
      .withMessage('Invalid email address entered')
      .customSanitizer(email => email.toLowerCase());
    req
      .checkBody('password').notEmpty()
      .withMessage('Password field is required');
    const errors = req.validationErrors();
    if (errors) {
      res.status(400).json({ error: errors[0].msg });
      return;
    }

    const query = `SELECT * from users WHERE email='${req.body.email}'`;
    const { rows, rowCount } = await DB.query(query);
    if (rowCount < 1) {
      res.status(401).json({ error: 'Email/Password is incorrect' });
      return;
    }

    const hashedPassword = rows[0].password;
    const verifyPassword = HelperUtils.verifyPassword(`${req.body.password}`, hashedPassword);
    if (!verifyPassword) {
      res.status(401).json({ error: 'Email/Password is incorrect' });
      return;
    }

    const userReq = rows[0];
    req.user = userReq;
    next();
  }
}
